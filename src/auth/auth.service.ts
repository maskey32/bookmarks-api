import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {
    constructor(
        private Prisma: PrismaService, 
        private jwt: JwtService,
        private config: ConfigService,
    ) {}

    async signup(dto: AuthDto) {
        try {
            const hash = await argon.hash(dto.password);
    
            const user = await this.Prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                }
            });
    
            delete user.hash;
    
            return user;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002')
                    throw new ForbiddenException('Credentilas taken',);
            }

            throw error;
        }
    }
    
    async signin(dto: AuthDto) {
        try {
            const user = await this.Prisma.user.findUnique({
                where: { email: dto.email, },
            });

            if (!user) throw new ForbiddenException('Credentials incorrect',);
            
            const pwMatches = await argon.verify(user.hash, dto.password,);

            if (!pwMatches) throw new ForbiddenException('Credentials incorrect',);

            return this.signToken(user.id, user.email);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002')
                    throw new ForbiddenException('Credentials taken',);
            }

            throw error;
        }
    }

    signToken(userId: number, email: string,): Promise<string> {
        const payload = {
            sub: userId,
            email,
        };

        const secret = this.config.get('JWT_SCRET');

        return this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret,
        });
    }
}