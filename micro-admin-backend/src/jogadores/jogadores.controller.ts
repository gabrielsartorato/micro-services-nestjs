import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Jogador } from './interfaces/jogador.interface';
import { JogadoresService } from './jogadores.service';

const ackErrors: string[] = ['E11000'];

@Controller('jogadores')
export class JogadoresController {
  constructor(private readonly jogadorService: JogadoresService) {}
  logger = new Logger(JogadoresController.name);

  @EventPattern('criar-jogador')
  async criarJogador(@Payload() jogador: Jogador, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.jogadorService.criarJogador(jogador);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      const filterAckerror = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckerror) {
        await channel.ack(originalMsg);
      }
    }
  }

  @MessagePattern('consultar-jogadores')
  async consultarJogadores(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      if (_id) {
        return await this.jogadorService.consultarJogadoresPorId(_id);
      } else {
        return await this.jogadorService.consultarTodosJogadores();
      }
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('atualizar-jogador')
  async atualizarJogador(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.jogadorService.atualizarJogador(data);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      const filterAckerror = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckerror) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('deletar-jogador')
  async deletarJogador(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.jogadorService.deletarJogador(_id);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      const filterAckerror = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckerror) {
        await channel.ack(originalMsg);
      }
    }
  }
}
