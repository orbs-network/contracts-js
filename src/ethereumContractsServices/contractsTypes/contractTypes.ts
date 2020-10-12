import {Callback} from "../../contracts/types";
import {EventEmitter} from "events";
import {EventOptions} from "../../contracts/StakingContract";

export type TUnsubscribeFunction = () => Promise<boolean|undefined>;

export type TContractEventSubscribeFunction<T> = (options?: EventOptions, cb?: Callback<T>) => EventEmitter;