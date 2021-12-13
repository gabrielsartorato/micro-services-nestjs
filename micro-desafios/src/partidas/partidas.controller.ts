import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Partida } from './interfaces/partida.interface';
import { PartidasService } from './partidas.service';

const ackErrors: string[] = ['E11000'];

@Controller('partidas')
export class PartidasController {
  constructor(private readonly partidaService: PartidasService) {}

  @EventPattern('criar-partida')
  async criarPartida(@Payload() partida: Partida, @Ctx() contex: RmqContext) {
    const channel = contex.getChannelRef();
    const originalMsg = contex.getMessage();

    try {
      await this.partidaService.criarPartida(partida);
      await channel.ack(originalMsg);
    } catch (err) {
      const filterAckError = ackErrors.filter((ackError) =>
        err.message.includes(ackError),
      );

      if (filterAckError) {
        await channel.ack(originalMsg);
      }
    }
  }
}
