import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const checkExistsTransaction = await transactionsRepository.findOne({
      where: { id },
    });

    if (!checkExistsTransaction) {
      throw new AppError('Transaction id not exists');
    }
    await transactionsRepository.remove(checkExistsTransaction);
  }
}

export default DeleteTransactionService;
