import { Module } from '@nestjs/common';
import { ClientproxyModule } from 'src/clientproxy/clientproxy.module';
import { DesafiosController } from './desafios.controller';

@Module({
  controllers: [DesafiosController],
  imports: [ClientproxyModule],
})
export class DesafiosModule {}
