import { Module } from '@nestjs/common';
import { Clientproxy } from './clientproxy';

@Module({
  exports: [Clientproxy],
  providers: [Clientproxy],
})
export class ClientproxyModule {}
