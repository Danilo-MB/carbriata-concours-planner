import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { StorageService, UserEntity } from '../storage/storage.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(JwtService) private readonly jwt: JwtService
  ) {}

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

    const user: UserEntity = {
      id,
      email: cleanEmail,
      passwordHash,
      name: name.trim(),
      createdAt: Date.now()
    };

    this.storage.createUser(user);

    const token = this.jwt.sign({ sub: user.id, email: user.email, name: user.name });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async login(email: string, password: string) {
    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail || !password) {
      throw new BadRequestException('Ingresa correo electrónico y contraseña.');
    }

    let user = this.storage.findUserByEmail(cleanEmail);

    // If demo admin user requested and doesn't exist, seed it on the fly
    if (!user && cleanEmail === 'demo@carbriata.com') {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('carbriata2027', salt);
      user = this.storage.createUser({
        id: 'u_demo',
        email: 'demo@carbriata.com',
        name: 'Danilo Carbriata',
        passwordHash: hash,
        createdAt: Date.now()
      });
    }

    if (!user) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos.');
    }

    const token = this.jwt.sign({ sub: user.id, email: user.email, name: user.name });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async getProfile(token: string) {
    if (!token) throw new UnauthorizedException('Token no proporcionado.');
    try {
      const payload = this.jwt.verify(token);
      const user = this.storage.findUserById(payload.sub);
      if (!user) throw new UnauthorizedException('Usuario no encontrado.');
      return {
        id: user.id,
        email: user.email,
        name: user.name
      };
    } catch {
      throw new UnauthorizedException('Sesión expirada o token inválido.');
    }
  }
}
