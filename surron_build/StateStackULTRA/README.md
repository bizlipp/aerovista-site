# StateStackULTRA

A lightweight, modular state management system that provides powerful tools for managing application state.

## Features

- **Minimal API**: Simple and intuitive API inspired by Redux but with less boilerplate
- **Modular Design**: Use only what you need - store, reducers, middleware, selectors
- **Performance Optimized**: Efficient state updates and memoized selectors
- **Developer Friendly**: Predictable state management with helpful error messages
- **TypeScript Compatible**: Works seamlessly with TypeScript projects
- **Framework Agnostic**: Use with any JavaScript framework or vanilla JS

## Installation

```bash
npm install state-stack-ultra
```

## Quick Start

```javascript
import { createStore, createReducer, createThunkMiddleware, applyMiddleware } from 'state-stack-ultra';

// Create a reducer
const counterReducer = createReducer({ count: 0 }, {
  'INCREMENT': (state) => ({ count: state.count + 1 }),
  'DECREMENT': (state) => ({ count: state.count - 1 }),
  'SET_COUNT': (state, action) => ({ count: action.payload })
});

// Create a store with middleware
const store = createStore(
  counterReducer,
  { count: 0 },
  applyMiddleware(createThunkMiddleware())
);

// Subscribe to state changes
store.subscribe(() => {
  console.log('New state:', store.getState());
});

// Dispatch actions
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'SET_COUNT', payload: 5 });

// Dispatch async action (thunk)
store.dispatch((dispatch) => {
  setTimeout(() => {
    dispatch({ type: 'DECREMENT' });
  }, 1000);
});
```

## Core Modules

### Store

The core of state management, providing methods to access state, dispatch actions, and subscribe to changes.

```javascript
import { createStore, applyMiddleware, combineReducers } from 'state-stack-ultra';

// Combine multiple reducers
const rootReducer = combineReducers({
  users: usersReducer,
  posts: postsReducer,
  comments: commentsReducer
});

// Create store with initial state and middleware
const store = createStore(
  rootReducer,
  { users: [], posts: [], comments: [] },
  applyMiddleware(middleware1, middleware2)
);

// Basic store API
const state = store.getState();
const unsubscribe = store.subscribe(() => console.log('State updated'));
store.dispatch({ type: 'ACTION_TYPE', payload: data });
```

### Reducers

Utilities for creating and combining reducers with less boilerplate.

```javascript
import { createReducer, createEntityReducer, createArrayReducer } from 'state-stack-ultra';

// Simple reducer with action handlers
const todoReducer = createReducer({ todos: [] }, {
  'ADD_TODO': (state, action) => ({
    todos: [...state.todos, action.payload]
  }),
  'TOGGLE_TODO': (state, action) => ({
    todos: state.todos.map(todo => 
      todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
    )
  })
});

// Entity reducer for normalized data
const usersReducer = createEntityReducer();

// Usage of entity reducer
store.dispatch({ 
  type: 'ADD_ENTITY', 
  payload: { id: 1, name: 'John', email: 'john@example.com' } 
});

// Array reducer for collections
const itemsReducer = createArrayReducer();

// Usage of array reducer
store.dispatch({ type: 'ADD_ITEM', payload: { text: 'New item' } });
```

### Middleware

Extend store functionality with custom middleware for logging, async actions, and more.

```javascript
import { 
  createLoggerMiddleware, 
  createThunkMiddleware, 
  createAPIMiddleware,
  composeMiddleware
} from 'state-stack-ultra';

// Logger middleware
const logger = createLoggerMiddleware({ collapsed: true });

// Thunk middleware for async actions
const thunk = createThunkMiddleware();

// API middleware for fetch operations
const api = createAPIMiddleware({ 
  baseUrl: 'https://api.example.com',
  headers: { 'Content-Type': 'application/json' }
});

// Apply middleware
const store = createStore(
  reducer,
  initialState,
  applyMiddleware(thunk, api, logger)
);

// Async action with thunk
const fetchUsers = () => (dispatch, getState) => {
  dispatch({ type: 'FETCH_USERS_REQUEST' });
  
  return fetch('/api/users')
    .then(response => response.json())
    .then(users => dispatch({ type: 'FETCH_USERS_SUCCESS', payload: users }))
    .catch(error => dispatch({ type: 'FETCH_USERS_FAILURE', error }));
};

// API action
const fetchPosts = {
  api: true,
  types: ['FETCH_POSTS_REQUEST', 'FETCH_POSTS_SUCCESS', 'FETCH_POSTS_FAILURE'],
  url: '/posts',
  method: 'GET'
};

store.dispatch(fetchUsers());
store.dispatch(fetchPosts);
```

### Selectors

Create efficient, memoized selectors for deriving data from state.

```javascript
import { createSelector, createEntitiesSelector, createSliceSelector } from 'state-stack-ultra';

// Basic selector
const getTodos = state => state.todos;

// Memoized selector for filtered todos
const getCompletedTodos = createSelector(
  getTodos,
  todos => todos.filter(todo => todo.completed)
);

// Slice selector for nested state
const getUserSettings = createSliceSelector('user.settings');

// Entity selector for normalized data
const getUserEntities = state => state.users.byId;
const getUserIds = state => state.users.allIds;
const getAllUsers = createEntitiesSelector(getUserEntities, getUserIds);

// Usage
const completedTodos = getCompletedTodos(store.getState());
const userSettings = getUserSettings(store.getState());
const allUsers = getAllUsers(store.getState());
```

## Advanced Usage

### Creating Custom Middleware

```javascript
const analyticsMiddleware = store => next => action => {
  if (action.type.includes('USER_')) {
    trackEvent(action.type, action.payload);
  }
  return next(action);
};

const store = createStore(
  reducer,
  applyMiddleware(analyticsMiddleware)
);
```

### Optimizing Performance with Selectors

```javascript
// Multiple input selectors
const getVisibilityFilter = state => state.visibilityFilter;
const getTodos = state => state.todos;

const getVisibleTodos = createSelector(
  [getTodos, getVisibilityFilter],
  (todos, filter) => {
    switch (filter) {
      case 'SHOW_COMPLETED':
        return todos.filter(todo => todo.completed);
      case 'SHOW_ACTIVE':
        return todos.filter(todo => !todo.completed);
      default:
        return todos;
    }
  }
);
```

## License

MIT 