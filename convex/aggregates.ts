// convex/userBalanceAggregate.ts
import { components } from './_generated/api';
import { DataModel } from './_generated/dataModel';
import { TableAggregate } from '@convex-dev/aggregate';

export const userBalanceAggregate = new TableAggregate<{
  Namespace: string; // Usaremos userId como namespace
  Key: number; // Timestamp para ordenar transacciones
  DataModel: DataModel;
  TableName: 'tokenTransactions';
}>(components.userBalances, {
  // Cada usuario tendrá su propio namespace aislado
  namespace: doc => doc.userId,
  // Ordenamos por timestamp de creación
  sortKey: doc => doc.createdAt,
  // El valor que se suma será positivo para income, negativo para expense
  sumValue: doc => (doc.type === 'income' ? doc.amount : -doc.amount),
});
