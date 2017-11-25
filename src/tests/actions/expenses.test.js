import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  addExpense,
  startAddExpense,
  removeExpense,
  startRemoveExpense,
  editExpense,
  setExpenses,
  startSetExpenses
} from '../../actions/expenses';
import expenses from '../fixtures/expenses';
import database from '../../firebase/firebase';

const createMockStore = configureMockStore([thunk]);

beforeEach((done) => {
  const expensesData = {};
  expenses.forEach(({id, description, note, amount, createdAt}) => {
    expensesData[id] = {description, note, amount, createdAt};
  });

  // "set" removes all data from expenses and set it each test again
  database.ref('expenses').set(expensesData).then(() => done());
});

// REMOVE_EXPENSE
test('should setup remove expense action object', () => {
  const action = removeExpense({id: '123abc'});
  expect(action).toEqual({type: 'REMOVE_EXPENSE', id: '123abc'})
});

test('should setup remove expense action object from database', (done) => {
  const store = createMockStore({});
  const id = expenses[0].id;

  store.dispatch(startRemoveExpense({ id })).then(() => {
    const actions = store.getActions();
    expect(actions[0]).toEqual({type: 'REMOVE_EXPENSE', id});
  }).then(() => {
    database.ref(`expenses/${id}`).once('value').then((snapshot) => {
      expect(snapshot.val()).toBeFalsy();
      done();
    })
  })
});

// EDIT_EXPENSE
test('should setup edit expense action object', () => {
  const action = editExpense('abc321', {description: 'test'});
  expect(action).toEqual({
    type: 'EDIT_EXPENSE',
    id: 'abc321',
    updates: {
      description: 'test'
    }
  })
});

// ADD_EXPENSE
test('should setup add expense action object with provided values', () => {
  const action = addExpense(expenses[2]);
  expect(action).toEqual({
    type: 'ADD_EXPENSE',
    expense: expenses[2]
  })
});

test('should add expense to database and store', (done) => {
  const store = createMockStore({});
  const expenseData = {
    description: 'Mouse',
    amount: 3000,
    note: 'This one is better',
    createdAt: 1000
  };

  store.dispatch(startAddExpense(expenseData)).then(() => {
    // build-in method to get all object that returns from inserted by user actions
    const actions = store.getActions();

    // take first action object (addExpense) and check it
    expect(actions[0]).toEqual({
      type: 'ADD_EXPENSE',
      expense: {
        id: expect.any(String),
        ...expenseData
      }
    });

    // request to DB to check if expense was inserted
    return database.ref(`expenses/${actions[0].expense.id}`).once('value');
  }).then((snapshot) => {
    expect(snapshot.val()).toEqual(expenseData);
    done();
  });
});

test('should add expense with defaults to database and store', (done) => {
  const store = createMockStore();
  const defaultExpense = {description: '', note: '', amount: 0, createdAt: 0};

  store.dispatch(startAddExpense({})).then(() => {
    const actions = store.getActions();

    expect(actions[0]).toEqual({
      type: 'ADD_EXPENSE',
      expense: {id: expect.any(String), ...defaultExpense}
    });

    return database.ref(`expenses/${actions[0].expense.id}`).once('value');
  }).then((snapshot) => {
    expect(snapshot.val()).toEqual(defaultExpense);
    done();
  })
});

// SET_EXPENSES
test('should setup set expense action object with data', () => {
  const action = setExpenses(expenses);
  expect(action).toEqual({
    type: 'SET_EXPENSES',
    expenses
  })
});

test('should fetch the expenses from database', (done) => {
  const store = createMockStore({});
  store.dispatch(startSetExpenses()).then(() => {
    const actions = store.getActions();
    expect(actions[0]).toEqual({
      type: 'SET_EXPENSES',
      expenses
    });
    done();
  })
});