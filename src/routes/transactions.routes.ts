import { Router, Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (req: Request, res: Response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({
    select: [
      'id',
      'category',
      'createdAt',
      'updatedAt',
      'value',
      'type',
      'title',
    ],
    relations: ['category'],
  });
  const balance = await transactionsRepository.getBalance();
  return res.json({ transactions, balance });
});

transactionsRouter.post('/', async (req: Request, res: Response) => {
  const { value, type } = req.body;
  const transactionTitle = req.body.title;
  const title = req.body.category;
  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    transactionTitle,
    value,
    type,
    title,
  });

  return res.json(transaction);
});

transactionsRouter.delete('/:id', async (req: Request, res: Response) => {
  const deleteTransactionService = new DeleteTransactionService();
  const { id } = req.params;
  await deleteTransactionService.execute({ id });
  return res.json({ ok: true });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (req: Request, res: Response) => {
    // const { buffer } = req.file;
    const importTransactionsService = new ImportTransactionsService();
    const transactions = await importTransactionsService.execute(req.file.path);
    return res.json(transactions);
  },
);

export default transactionsRouter;
