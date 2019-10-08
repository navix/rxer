import { OnDestroy } from '@angular/core';
import produce from 'immer';
import { BehaviorSubject, Observable, Observer } from 'rxjs';

function isDraftable(value) {
  if (!value) {
    return false;
  }
  return isPlainObject(value);
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  const proto = Object.getPrototypeOf(value);
  return !proto || proto === Object.prototype;
}

/**
 * Deep freeze if possible.
 */
export function deepFreeze(obj) {
  if (!isDraftable(obj) || Object.isFrozen(obj)) {
    return;
  }
  Object.freeze(obj);
  if (Array.isArray(obj)) {
    obj.forEach(deepFreeze);
  } else {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        deepFreeze(obj[key]);
      }
    }
  }
}

/**
 * Deep clone.
 */
export function clone(obj) {
  if (!isDraftable(obj)) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(clone);
  }
  const cloned = Object.create(Object.getPrototypeOf(obj));
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = clone(obj[key]);
    }
  }
  return cloned;
}

export interface StateValueOptions {
  noClone?: boolean;
  noFreeze?: boolean;
}

export class StateValue<T = any> implements OnDestroy {
  private _value: BehaviorSubject<T>;

  private options: Required<StateValueOptions> = {
    noClone: false,
    noFreeze: false,
  };

  constructor(
    private initialValue: T,
    options?: StateValueOptions,
  ) {
    this.options = {...this.options, ...options};
    this._value = new BehaviorSubject<T>(this.prepareNewValue(initialValue, this.options));
  }

  ngOnDestroy(): void {
    // Complete Subject in case if State was provided directly.
    this.complete();
  }

  /**
   * Get current value.
   */
  get value() {
    return this._value.value;
  }

  /**
   * Set new value.
   */
  set value(value: T) {
    this._value.next(this.prepareNewValue(value, this.options));
  }

  /**
   * Get Observable with value.
   */
  get valueChanges(): Observable<T> {
    return this._value.asObservable();
  }

  /**
   * Get Observer shortcut. Pass it to .subscribe method.
   */
  get observer(): Observer<T> {
    return this._value;
  }

  /**
   * Set new value. With options if needed.
   */
  setValue(value: T, options: StateValueOptions = {}) {
    this._value.next(this.prepareNewValue(value, {...this.options, ...options}));
  }

  /**
   * Complete value Subject.
   */
  complete() {
    this._value.complete();
  }

  /**
   * Set initial value.
   */
  reset() {
    this.value = this.initialValue;
  }

  /**
   * Produce next value using Immerjs (https://github.com/immerjs/immer).
   */
  produce(producer: (draft: T) => void) {
    this.setValue(produce(this.value, producer), {
      noClone: true,
    });
  }

  /**
   * Clone and freeze if needed.
   */
  private prepareNewValue(value, options: Required<StateValueOptions>) {
    const prepared = options.noClone ? value : clone(value);
    if (!options.noFreeze) {
      deepFreeze(prepared);
    }
    return prepared;
  }
}
