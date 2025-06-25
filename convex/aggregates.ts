// convex/userBalanceAggregate.ts
import { components } from './_generated/api';
import { DataModel, Id } from './_generated/dataModel';
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

export const battleAggregate = new TableAggregate<{
  Key: [
    'resolved_with_winner' | 'resolved_tie' | 'open', // Categoría: "resolved_with_winner", "resolved_tie", "open", etc.
    Id<'users'>, // Usuario: createdBy o winnerId (según categoría)
    number, // Timestamp: createdAt o resolvedAt (según categoría)
  ];
  DataModel: DataModel;
  TableName: 'battles';
}>(components.battles, {
  sortKey: doc => {
    // La key tiene 3 partes: [categoría, usuario, timestamp]
    if (!doc.resolved) {
      // Batalla abierta
      return ['open', doc.createdBy, doc.createdAt];
    } else if (doc.winnerId) {
      // Batalla resuelta con ganador
      return ['resolved_with_winner', doc.winnerId, doc.resolvedAt || 0];
    } else {
      // Batalla resuelta en empate
      return ['resolved_tie', doc.createdBy, doc.resolvedAt || 0];
    }
  },
  sumValue: doc => doc.amount, // Siempre suma el amount
});
