import { Module } from '@nestjs/common';
import { ProxyrmqService } from './proxyrmq.service';

@Module({
  providers: [ProxyrmqService],
  exports: [ProxyrmqService],
})
export class ProxyrmqModule {}
