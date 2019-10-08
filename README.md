# Angular state management with RxJS + Immer

Simple wrapper for BehaviorSubject with Immer integration.

StateValue automatically clones and freezes all states.

## Installation

```typescript
npm i @ngx-kit/state immer
```

## Usage

### Create `StateValue`

```typescript
export class AppComponent {
  readonly data = new StateValue<SomeValueInterface>(initialData);
}
```

### Get value

```typescript
this.data.value
```

### Observe value

```typescript
this.data.valueChanges
```

### Set value

```typescript
this.data.value = newData;
```

### Produce new value using Immer

Works properly only with objects and arrays in the state.

More info about Immer: https://immerjs.github.io/immer/

```typescript
this.data.produce(draft => {
  draft.entry = newEntry;
});
```

### Reset value to initial

```typescript
this.data.reset();
```

### Subscribe to another Observable

```typescript
someObervable.subscribe(this.data.observer);
```

### StateValue options

* noClone — do not clone all passed values
* noFreeze — do not freeze all passed values

```typescript
new StateValue<SomeValueInterface>(initialData, {
  noClone: true,
  noFreeze: true,
});
```
