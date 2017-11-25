import React from 'react';
import {connect} from 'react-redux';

import ExpenseForm from './ExpenseForm'
import {editExpense, startRemoveExpense} from '../actions/expenses';


export class EditExpensePage extends React.Component {
  onSubmit = (expense) => {
    this.props.editExpense(this.props.expense.id, expense);
    this.props.history.push('/');
  };

  onRemove = () => {
    this.props.startRemoveExpense({id: this.props.expense.id});
    this.props.history.push('/');
  };

  render() {
    return (
      <div>
        <ExpenseForm
          expense={this.props.expense}
          onSubmit={this.onSubmit}
        />
        <button onClick={this.onRemove}>
          Remove
        </button>
      </div>
    )
  }
};

const mapStateToProps = (state, props) => {
  return {
    expense: state.expenses.find((expense) => expense.id === props.match.params.id)
  }
};

// 1st arg - dispatch from connect
// 2nd arg - arg thar passed from inner func (etc id of clicked elem)
const mapDispatchToProps = (dispatch, props) => ({
  editExpense: (id, updates) => dispatch(editExpense(id, updates)),
  startRemoveExpense: (data) =>  dispatch(startRemoveExpense(data)), // from onRemove: {id: 21313...}
});

export default connect(mapStateToProps, mapDispatchToProps)(EditExpensePage);