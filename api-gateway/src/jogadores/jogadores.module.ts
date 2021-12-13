import { Module } from '@nestjs/common';
import { JogadoresController } from './jogadores.controller';
import { ClientproxyModule } from '../clientproxy/clientproxy.module';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  controllers: [JogadoresController],
  imports: [ClientproxyModule, AwsModule],
})
export class JogadoresModule {}
