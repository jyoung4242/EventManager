import "./style.css";
import { UI } from "@peasy-lib/peasy-ui";
import { Assets } from "@peasy-lib/peasy-assets";
import { Input } from "@peasy-lib/peasy-input";
import { States, State } from "@peasy-lib/peasy-states";

type dir = "left" | "right" | "up" | "down";

/****************
 * setting up peasy
 ***************/
const model = {
  runSeq1: (_Ev: any, model: any) => {},
  runSeq2: (_Ev: any, model: any) => {},
  myInput: undefined,
};

const template = `<div> 
    <h1>EVENT MANAGER TEST</h1>
    <div>
        <button \${click@=>runSeq1}>RUN SEQ1</button> <!-- binding click to to peasy -->
    </div>
    <div>
        <button \${click@=>runSeq2}>RUN SEQ2</button> <!-- binding click to to peasy -->
    </div>
    <div>
        <input \${==>myInput}/>   <!-- binding myinput to peasy -->
    </div>
</div>`;
UI.create(document.body, model, template);

/****************
 * system setup for event engine
 ***************/
class eventmanager {
  isPaused: boolean = false;
  eventStates = new eventstates();
  sequence: Array<myEvent> = [];
  nextEvent: myEvent | undefined;
  eventIndex: number = 0;

  constructor() {}

  pause() {
    this.isPaused = true;
  }
  unpause() {
    this.isPaused = false;
  }

  init(events: Array<myEvent>) {
    const mysequence = [new paused(), ...events];
    this.eventStates.register(mysequence);
  }
}
class eventstates extends States {}
class myEvent extends State {}

/****************
 * system state
 ***************/
class paused extends myEvent {
  constructor() {
    super(null, "paused");
  }
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    return new Promise(resolve => {
      resolve();
    });
  }
  leave(_next: State | null, ...params: any): void | Promise<void> {}
}

/****************
 * user states
 ***************/
class walk extends myEvent {
  direction: dir;
  state: any;
  constructor(direction: dir, model: any) {
    super(null, "walk");
    this.direction = direction;
    this.state = model;
  }
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    return new Promise(resolve => {
      this.state.myInput.value = this.direction;
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }
  leave(_next: State | null, ...params: any): void | Promise<void> {}
}

class wait extends myEvent {
  state: any;
  duration: number;
  constructor(howlong: number, model: any) {
    super(null, "wait");
    this.state = model;
    this.duration = howlong;
  }
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    return new Promise(resolve => {
      this.state.myInput.value = "waiting";
      setTimeout(() => {
        resolve();
      }, this.duration);
    });
  }
  leave(_next: State | null, ...params: any): void | Promise<void> {}
}

class alert extends myEvent {
  state: any;
  text: string;
  constructor(alertstring: string, model: any) {
    super(null, "alert");
    this.state = model;
    this.text = alertstring;
  }
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    return new Promise(resolve => {
      window.alert(this.text);
      resolve();
    });
  }
  leave(_next: State | null, ...params: any): void | Promise<void> {}
}

/****************
 * user sequences
 ***************/
const seq1: Array<myEvent> = [new walk("up", model), new wait(1000, model), new alert("seq 1 done", model)];
const seq2: Array<myEvent> = [
  new walk("down", model),
  new walk("left", model),
  new wait(2000, model),
  new wait(5000, model),
  new walk("up", model),
  new walk("right", model),
  new alert("seq 2 done", model),
];

//define user eventmanager
const myEventMgr = eventmanager;
