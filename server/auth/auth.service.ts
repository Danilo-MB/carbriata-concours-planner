import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { isAdminEmail, StorageService, UserEntity } from '../storage/storage.service';

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
    @Inject(JwtService) private readonly jwt: JwtService
  ) {}

  private toUserDto(user: UserEntity) {
    const isAdmin = user.role === 'admin' || isAdminEmail(user.email);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: (isAdmin ? 'admin' : user.role || 'user') as 'admin' | 'user',
      isAdmin
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

    const existing = this.storage.findUserByEmail(cleanEmail);
    if (existing) {
      throw new BadRequestException('Ya existe una cuenta registrada con este correo electrónico.');
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
      createdAt: Date.now()
    };

    this.storage.createUser(user);

    const userDto = this.toUserDto(user);
    const token = this.jwt.sign({ sub: user.id, email: user.email, name: user.name, role: userDto.role, isAdmin: userDto.isAdmin });

    return { token, user: userDto };
  }

  async login(email: string, password: string) {
    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail || !password) {
      throw new BadRequestException('Ingresa correo electrónico y contraseña.');
    }

    const user = this.storage.findUserByEmail(cleanEmail);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos.');
    }

    const userDto = this.toUserDto(user);
    const token = this.jwt.sign({ sub: user.id, email: user.email, name: user.name, role: userDto.role, isAdmin: userDto.isAdmin });

    return { token, user: userDto };
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

    let user = this.storage.findUserByEmail(cleanEmail);
    const isAdmin = isAdminEmail(cleanEmail);

    if (!user) {
      user = this.storage.createUser({
        id: 'u_goog_' + Math.random().toString(36).substring(2, 10),
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        createdAt: Date.now()
      });
    } else if (isAdmin && user.role !== 'admin') {
      user = this.storage.updateUser(user.id, { role: 'admin' }) || user;
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

    let user = this.storage.findUserByEmail(cleanEmail);
    const isAdmin = isAdminEmail(cleanEmail);

    if (!user) {
      user = this.storage.createUser({
        id: 'u_appl_' + Math.random().toString(36).substring(2, 10),
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        createdAt: Date.now()
      });
    } else if (isAdmin && user.role !== 'admin') {
      user = this.storage.updateUser(user.id, { role: 'admin' }) || user;
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
    const magicLink = `${baseUrl}/?magic_token=${token}&email=${encodeURIComponent(cleanEmail)}`;

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
          subject: 'Tu enlace de acceso a MapFlex',
          html: `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
              <h2 style="color: #0f172a; margin-top: 0;">Ingresar a MapFlex</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">Usa este enlace mágico para acceder directamente a tu cuenta sin contraseña:</p>
              <div style="margin: 24px 0;">
                <a href="${magicLink}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">Ingresar a MapFlex</a>
              </div>
              <p style="color: #64748b; font-size: 13px;">O copia e ingresa este código de 6 dígitos en la pantalla de inicio:</p>
              <div style="padding: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; font-size: 20px; font-weight: 700; letter-spacing: 4px; text-align: center; color: #0f172a;">
                ${code}
              </div>
              <p style="color: #94a3b8; font-size: 11px; margin-top: 24px;">Este enlace expira en 15 minutos. Si no solicitaste este acceso, puedes ignorar este correo.</p>
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
      let user = this.storage.findUserByEmail(cleanEmail);
      const isAdmin = isAdminEmail(cleanEmail);

      if (!user) {
        user = this.storage.createUser({
          id: 'u_' + Math.random().toString(36).substring(2, 10),
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          role: isAdmin ? 'admin' : 'user',
          createdAt: Date.now()
        });
      } else if (isAdmin && user.role !== 'admin') {
        user = this.storage.updateUser(user.id, { role: 'admin' }) || user;
      }

      await this.storage.deleteMagicEntry(cleanEmail);

      const userDto = this.toUserDto(user);
      const authToken = this.jwt.sign({ sub: user.id, email: user.email, name: user.name, role: userDto.role, isAdmin: userDto.isAdmin });

      return { token: authToken, user: userDto };
    } catch {
      throw new UnauthorizedException('El enlace mágico ha expirado o ya fue utilizado.');
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
      throw new UnauthorizedException('El código es incorrecto o ha expirado. Solicita uno nuevo.');
    }

    let user = this.storage.findUserByEmail(cleanEmail);
    const isAdmin = isAdminEmail(cleanEmail);

    if (!user) {
      user = this.storage.createUser({
        id: 'u_' + Math.random().toString(36).substring(2, 10),
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        createdAt: Date.now()
      });
    } else if (isAdmin && user.role !== 'admin') {
      user = this.storage.updateUser(user.id, { role: 'admin' }) || user;
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
      const user = this.storage.findUserById(payload.sub);
      if (!user) throw new UnauthorizedException('Usuario no encontrado.');
      return this.toUserDto(user);
    } catch {
      throw new UnauthorizedException('Sesión expirada o token inválido.');
    }
  }
}
