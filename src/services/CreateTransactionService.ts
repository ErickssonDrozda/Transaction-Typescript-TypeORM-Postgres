import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  transactionTitle: string;
  value: number;
  type: 'income' | 'outcome';
  title: string;
}

class CreateTransactionService {
  public async execute({
    transactionTitle,
    value,
    type,
    title,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type value must be a "income" or "outcome".');
    }

    if (!title || !transactionTitle || !value) {
      throw new AppError('all fields is required.');
    }

    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (balance.total < value) {
        throw new AppError(
          'You have not enough income to make outcome transactions',
        );
      }
    }

    const checkCategoryExists = await categoryRepository.findOne({
      where: { title },
    });

    let selectedCategory = {} as Category;
    if (!checkCategoryExists) {
      const newCategory = categoryRepository.create({
        title,
      });
      await categoryRepository.save(newCategory);
      selectedCategory = newCategory;
    } else {
      selectedCategory = checkCategoryExists;
    }
    const transaction = transactionsRepository.create({
      title: transactionTitle,
      value,
      type,
      category_id: selectedCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
