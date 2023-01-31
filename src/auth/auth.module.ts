import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthContoller } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    imports: [JwtModule.register({})],
    controllers: [AuthContoller],
    providers: [AuthService],
})
export class AuthModule {}