export interface MetadadosReagendamento {
  novaData?: Date;
  novoEndereco?: string;
}

export enum StatusNotificacao {
  PENDENTE = 'PENDENTE',
  ENVIADA = 'ENVIADA',
  RESPONDIDA = 'RESPONDIDA',
  ERRO = 'ERRO'
}

export enum IntencaoDetectada {
  CONFIRMAR = 'CONFIRMAR',
  REAGENDAR = 'REAGENDAR',
  ALTERAR_ENDERECO = 'ALTERAR_ENDERECO',
  CANCELAR = 'CANCELAR',
  NAO_IDENTIFICADA = 'NAO_IDENTIFICADA'
}

export interface NotificacaoEntrega {
  id: string;
  encomendaId: string;
  telefone: string;
  dataEnvio: Date;
  dataEntregaPrevista: Date;
  status: StatusNotificacao;
  respostaRecebida?: string;
  intencaoDetectada?: IntencaoDetecta;
  metadados?: MetadadosReagendamento;
  criadoEm: Date;
  atualizadoEm: Date;
}

export function validarTelefone(telefone: string): boolean {
  const regex = /^\+?[1-9]\d{10,14}$/;
  return regex.test(telefone.replace(/[\s()-]/g, ''));
}

export function validarDataEntregaPrevista(data: Date): boolean {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return data >= hoje;
}

export function criarNotificacaoEntrega(
  dados: Omit<NotificacaoEntrega, 'id' | 'criadoEm' | 'atualizadoEm'>
): NotificacaoEntrega {
  if (!validarTelefone(dados.telefone)) {
    throw new Error('Telefone inválido');
  }
  if (!validarDataEntregaPrevista(dados.dataEntregaPrevista)) {
    throw new Error('Data de entrega prevista deve ser maior ou igual a hoje');
  }
  if (dados.intencaoDetectada === IntencaoDetectada.REAGENDAR && !dados.metadados?.novaData) {
    throw new Error('Nova data obrigatória para intenção de reagendamento');
  }
  if (dados.intencaoDetectada === IntencaoDetectada.ALTERAR_ENDERECO && !dados.metadados?.novoEndereco) {
    throw new Error('Novo endereço obrigatório para intenção de alteração de endereço');
  }
  const agora = new Date();
  return {
    ...dados,
    id: crypto.randomUUID(),
    criadoEm: agora,
    atualizadoEm: agora
  };
}