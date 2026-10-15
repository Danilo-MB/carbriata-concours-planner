import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { isAdminEmail, StorageService, UserEntity } from '../storage/storage.service';
import { MailService } from './mail.service';

function parseJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(json);
    }
  } catch {
    // ignore
  }
  return null;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(MailService) private readonly mailService: MailService
  ) {}

  private toUserDto(user: UserEntity) {
    const isAdmin = user.role === 'admin' || isAdminEmail(user.email);
    const emailVerified = Boolean(isAdmin || user.emailVerified);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: (isAdmin ? 'admin' : user.role || 'user') as 'admin' | 'user',
      isAdmin,
      emailVerified
    };
  }

  async register(email: string, password: string, name: string) {
    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail || !password || !name) {
      throw new BadRequestException('Todos los campos son obligatorios: email, password y nombre.');
    }
    if (password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres.');
    }

    // Validate domain existence via DNS MX & disposable block
    const domainCheck = await this.mailService.validateEmail(cleanEmail);
    if (!domainCheck.valid) {
      throw new BadRequestException(domainCheck.reason || 'El correo ingresado no es válido o no existe.');
    }

    const existing = await this.storage.findUserByEmail(cleanEmail);
    if (existing) {
      if (existing.passwordHash) {
        throw new BadRequestException('Ya existe una cuenta registrada con este correo electrónico. Inicia sesión.');
      }
      // User existed without password (e.g. from social/magic link), set password now
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const isAdmin = isAdminEmail(cleanEmail);
      const updated = await this.storage.updateUser(existing.id, {
        passwordHash,
        name: name.trim() || existing.name,
        role: isAdmin ? 'admin' : (existing.role || 'user'),
        emailVerified: Boolean(isAdmin || existing.emailVerified)
      });
      const userDto = this.toUserDto(updated || existing);
      const token = this.jwt.sign({ sub: existing.id, email: existing.email, name: userDto.name, role: userDto.role, isAdmin: userDto.isAdmin, emailVerified: userDto.emailVerified });

      if (!userDto.emailVerified) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await this.storage.setVerificationCode(cleanEmail, code);
        await this.mailService.sendVerificationCode(cleanEmail, code, userDto.name);
      }

      return { token, user: userDto, needsVerification: !userDto.emailVerified };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const id = 'u_' + Math.random().toString(36).substring(2, 10);
    const isAdmin = isAdminEmail(cleanEmail);

    const user: UserEntity = {
      id,
      email: cleanEmail,
      passwordHash,
      name: name.trim(),
      role: isAdmin ? 'admin' : 'user',
      emailVerified: isAdmin,
      createdAt: Date.now()
    };

    await this.storage.createUser(user);

    const userDto = this.toUserDto(user);
    const token = this.jwt.sign({ sub: user.id, email: user.email, name: user.name, role: userDto.role, isAdmin: userDto.isAdmin, emailVerified: userDto.emailVerified });

    // Send 6-digit OTP code via Resend if not admin
    if (!userDto.emailVerified) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await this.storage.setVerificationCode(cleanEmail, code);
      await this.mailService.sendVerificationCode(cleanEmail, code, user.name);
    }

    return { token, user: userDto, needsVerification: !userDto.emailVerified };
  }

  async login(email: string, password: string) {
    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail || !password) {
      throw new BadRequestException('Ingresa correo electrónico y contraseña.');
    }

    const user = await this.storage.findUserByEmail(cleanEmail);
    if (!user) {
      throw new UnauthorizedException('No encontramos una cuenta con este correo. Haz clic en "Crear Cuenta" para registrarte.');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException('Esta cuenta aún no tiene contraseña. Haz clic en "Crear Cuenta" para establecerla.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos.');
    }

    const userDto = this.toUserDto(user);
    const token = this.jwt.sign({ sub: user.id, email: user.email, name: user.name, role: userDto.role, isAdmin: userDto.isAdmin, emailVerified: userDto.emailVerified });

    return { token, user: userDto, needsVerification: !userDto.emailVerified };
  }

  async verifyEmail(email: string, code: string) {
    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail || !code) {
      throw new BadRequestException('Ingresa el correo y el código de 6 dígitos.');
    }

    const savedCode = await this.storage.getVerificationCode(cleanEmail);
    if (!savedCode || savedCode.trim() !== code.trim()) {
      throw new BadRequestException('Código incorrecto o expirado. Revisa tu correo o solicita uno nuevo.');
    }

    await this.storage.deleteVerificationCode(cleanEmail);

    let user = await this.storage.findUserByEmail(cleanEmail);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    user = (await this.storage.updateUser(user.id, { emailVerified: true })) || user;

    const userDto = this.toUserDto(user);
    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: userDto.role,
      isAdmin: userDto.isAdmin,
      emailVerified: true
    });

    return { token, user: userDto };
  }

  async resendVerificationCode(email: string) {
    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail) {
      throw new BadRequestException('Ingresa tu correo electrónico.');
    }

    const user = await this.storage.findUserByEmail(cleanEmail);
    if (!user) {
      throw new BadRequestException('No encontramos un usuario con este correo.');
    }

    if (user.emailVerified || isAdminEmail(cleanEmail)) {
      return { success: true, message: 'Esta cuenta ya está verificada.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.storage.setVerificationCode(cleanEmail, code);
    await this.mailService.sendVerificationCode(cleanEmail, code, user.name);

    return { success: true, message: 'Código reenviado con éxito.' };
  }

  async loginWithGoogle(payload: { credential?: string; email?: string; name?: string; sub?: string }) {
    let cleanEmail = payload.email?.toLowerCase().trim();
    let name = payload.name?.trim();

    if (payload.credential) {
      const decoded = parseJwtPayload(payload.credential);
      if (decoded) {
        if (!cleanEmail && decoded.email) cleanEmail = decoded.email.toLowerCase().trim();
        if (!name && (decoded.name || decoded.given_name)) name = (decoded.name || decoded.given_name).trim();
      }
    }

    if (!cleanEmail) {
      throw new BadRequestException('No se pudo obtener el correo de la cuenta de Google.');
    }

    let user = await this.storage.findUserByEmail(cleanEmail);
    const isAdmin = isAdminEmail(cleanEmail);

    if (!user) {
      user = await this.storage.createUser({
        id: 'u_goog_' + Math.random().toString(36).substring(2, 10),
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        createdAt: Date.now()
      });
    } else if (isAdmin && user.role !== 'admin') {
      user = (await this.storage.updateUser(user.id, { role: 'admin' })) || user;
    }

    const userDto = this.toUserDto(user);
    const token = this.jwt.sign({ sub: user.id, email: user.email, name: user.name, role: userDto.role, isAdmin: userDto.isAdmin });

    return { token, user: userDto };
  }

  async loginWithApple(payload: { credential?: string; email?: string; name?: string; sub?: string }) {
    let cleanEmail = payload.email?.toLowerCase().trim();
    let name = payload.name?.trim();

    if (payload.credential) {
      const decoded = parseJwtPayload(payload.credential);
      if (decoded) {
        if (!cleanEmail && decoded.email) cleanEmail = decoded.email.toLowerCase().trim();
        if (!name && (decoded.name || decoded.email)) name = (decoded.name || decoded.email).trim();
      }
    }

    if (!cleanEmail) {
      throw new BadRequestException('No se pudo obtener el correo de la cuenta de Apple.');
    }

    let user = await this.storage.findUserByEmail(cleanEmail);
    const isAdmin = isAdminEmail(cleanEmail);

    if (!user) {
      user = await this.storage.createUser({
        id: 'u_appl_' + Math.random().toString(36).substring(2, 10),
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        createdAt: Date.now()
      });
    } else if (isAdmin && user.role !== 'admin') {
      user = (await this.storage.updateUser(user.id, { role: 'admin' })) || user;
    }

    const userDto = this.toUserDto(user);
    const token = this.jwt.sign({ sub: user.id, email: user.email, name: user.name, role: userDto.role, isAdmin: userDto.isAdmin });

    return { token, user: userDto };
  }

  async sendMagicLink(email: string, origin?: string) {
    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new BadRequestException('Ingresa un correo electrónico válido.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = this.jwt.sign({ email: cleanEmail, code, type: 'magic' }, { expiresIn: '15m' });

    await this.storage.setMagicEntry(cleanEmail, { code, token });

    const baseUrl = origin || process.env.PUBLIC_URL || 'https://mapflex.app';
    const magicLink = `${baseUrl}/?access_token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    // Optional email dispatch via Resend
    if (process.env.RESEND_API_KEY) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'MapFlex <soporte@mapflex.app>',
          to: cleanEmail,
          subject: 'Tu link de acceso a MapFlex',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Link de acceso a MapFlex</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6;">Haz clic en el botón siguiente para ingresar directamente a tu cuenta:</p>
              <div style="margin: 28px 0;">
                <a href="${magicLink}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">Ingresar a MapFlex</a>
              </div>
              <p style="color: #64748b; font-size: 13px;">O copia e ingresa este código de 6 dígitos si lo prefieres:</p>
              <div style="padding: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: 700; letter-spacing: 5px; text-align: center; color: #0f172a;">
                ${code}
              </div>
              <p style="color: #94a3b8; font-size: 11px; margin-top: 28px;">Este enlace expira en 15 minutos.</p>
            </div>
          `
        })
      }).catch((err) => console.warn('Could not dispatch Resend email:', err));
    }

    return {
      success: true,
      email: cleanEmail,
      devCode: code,
      devLink: magicLink
    };
  }

  async verifyMagicToken(token: string) {
    if (!token) throw new BadRequestException('Token de acceso no proporcionado.');
    try {
      const payload = this.jwt.verify(token);
      if (payload.type !== 'magic' || !payload.email) {
        throw new BadRequestException('Token de acceso no válido.');
      }

      const cleanEmail = payload.email.toLowerCase().trim();
      let user = await this.storage.findUserByEmail(cleanEmail);
      const isAdmin = isAdminEmail(cleanEmail);

      if (!user) {
        user = await this.storage.createUser({
          id: 'u_' + Math.random().toString(36).substring(2, 10),
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          role: isAdmin ? 'admin' : 'user',
          createdAt: Date.now()
        });
      } else if (isAdmin && user.role !== 'admin') {
        user = (await this.storage.updateUser(user.id, { role: 'admin' })) || user;
      }

      await this.storage.deleteMagicEntry(cleanEmail);

      const userDto = this.toUserDto(user);
      const authToken = this.jwt.sign({ sub: user.id, email: user.email, name: user.name, role: userDto.role, isAdmin: userDto.isAdmin });

      return { token: authToken, user: userDto };
    } catch {
      throw new UnauthorizedException('El enlace de acceso ha expirado o ya fue utilizado.');
    }
  }

  async verifyMagicCode(email: string, code: string) {
    const cleanEmail = email?.toLowerCase().trim();
    const cleanCode = code?.trim();

    if (!cleanEmail || !cleanCode) {
      throw new BadRequestException('Ingresa el correo y el código de 6 dígitos.');
    }

    const entry = await this.storage.getMagicEntry(cleanEmail);
    if (!entry || entry.code !== cleanCode) {
      throw new UnauthorizedException('El código es incorrecto o ha expirado. Solicita un nuevo enlace.');
    }

    let user = await this.storage.findUserByEmail(cleanEmail);
    const isAdmin = isAdminEmail(cleanEmail);

    if (!user) {
      user = await this.storage.createUser({
        id: 'u_' + Math.random().toString(36).substring(2, 10),
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        createdAt: Date.now()
      });
    } else if (isAdmin && user.role !== 'admin') {
      user = (await this.storage.updateUser(user.id, { role: 'admin' })) || user;
    }

    await this.storage.deleteMagicEntry(cleanEmail);

    const userDto = this.toUserDto(user);
    const authToken = this.jwt.sign({ sub: user.id, email: user.email, name: user.name, role: userDto.role, isAdmin: userDto.isAdmin });

    return { token: authToken, user: userDto };
  }

  async getProfile(token: string) {
    if (!token) throw new UnauthorizedException('Token no proporcionado.');
    try {
      const payload = this.jwt.verify(token);
      let user = await this.storage.findUserById(payload.sub);
      if (!user && payload.email) {
        user = await this.storage.findUserByEmail(payload.email);
      }
      if (user) {
        return this.toUserDto(user);
      }

      // Self-contained fallback: reconstruct authentic user from verified cryptographic JWT payload
      const cleanEmail = (payload.email || '').toLowerCase().trim();
      const isAdmin = payload.isAdmin || payload.role === 'admin' || isAdminEmail(cleanEmail);
      const userObj: UserEntity = {
        id: payload.sub,
        email: cleanEmail,
        name: payload.name || cleanEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        createdAt: Date.now()
      };
      await this.storage.createUser(userObj);
      return this.toUserDto(userObj);
    } catch {
      throw new UnauthorizedException('Sesión expirada o token inválido.');
    }
  }
}
