# Trello Clone

- we are going to seperate tasks by sections and give drag and drop ability to users to move tasks around. 

# Development

# 1 Get Selector
- Proof of concepts:

- This proof od concept will be shown through giving an example.

Build a time coverter that takes the minutes and convert into an our.

App.tsx
```js
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { hourSelector, minuteState } from "./atoms";

function App() {
  // use recoil to get the state and the setter from atom.
  const [minutes, setMinutes] = useRecoilState(minuteState);
  // use recoil to get the value from hourSelector from atom.
  const hours = useRecoilValue(hourSelector);
  // once the value inside the input changes, it will use the setter to update the state Minutes.
  const onMinutesChange = (event: React.FormEvent<HTMLInputElement>) => {
    setMinutes(+event.currentTarget.value);
  };
  return (
    <div>
      <input
        value={minutes}
        onChange={onMinutesChange}
        type="number"
        placeholder="Minutes"
      />
      <input value={hours} type="number" placeholder="Hours" />
    </div>
  );
}

export default App;
```

atom.tsx
```java
import { atom, selector } from "recoil";

export const minuteState = atom({
  key: "minutes",
  default: 0,
});

export const hourSelector = selector({
  key: "hours",
  // when the hourSelector is called, it will get the minutes and convert it to hours.
  get: ({ get }) => {
    const minutes = get(minuteState);
    return minutes / 60;
  },
});
```

# 2 Set Selectors

- Setter will set the value.
- You can use setter that modify the value of other.
    - if you put in the hour, it will change the value of minutes also. 

snippet of atoms.tsx:
```js
  set: ({ set }, newValue) => {
    const minutes = Number(newValue) * 60;
    set(minuteState, minutes);
  },
```

snippet of app.tsx:
```js
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { hourSelector, minuteState } from "./atoms";

function App() {
......
  const [hours, setHours] = useRecoilState(hourSelector);
  // once the value inside the input changes, it will use the setter to update the state Minutes.
  const onMinutesChange = (event: React.FormEvent<HTMLInputElement>) => {
    setMinutes(+event.currentTarget.value);
  };
  // On input for hour onchange, it will use the setter to update minutes.
  const onHoursChange = (event: React.FormEvent<HTMLInputElement>) => {
    setHours(+event.currentTarget.value);
  };
  return (
    <div>
      <input
        value={minutes}
        onChange={onMinutesChange}
        type="number"
        placeholder="Minutes"
      />
      <input
        onChange={onHoursChange}
        value={hours}
        type="number"
        placeholder="Hours"
      />
      <input value={hours} type="number" placeholder="Hours" />
    </div>
  );
}

export default App;
```

# 3 Drag and Drop 

- In your developer life, you will need to create something that create reorder of tasks.
- You can use *react-beautiful-dnd*
```js
npm i react-beautiful-dnd
```

Components:
<DragDropContext>: part of your app that allows drag and drop
<Droppable>: place where you drop
<Draggable>: Draggable content

- when you use these components, you have to give the draggableID for <Draggable>.

App.tsx
```js
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function App() {
  const onDragEnd = () => {};
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        <Droppable droppableId="one">
          {() => (
            <ul>
              <Draggable draggableId="first" index={0}>
                {() => <li>One</li>}
              </Draggable>
              <Draggable draggableId="second" index={1}>
                {() => <li>Two</li>}
              </Draggable>
            </ul>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}

export default App;
```

atom.tsx:
```js
import { atom, selector } from "recoil";
```


- We put funciton as the children of draggable because they need a special props to activiate drag and drop animation.
- we just need a first argument. It is called a provider. 
- Drag from any postion vs Drag from the corner.
- Drag in the corner will be
```js
{(magic) => (
    <ul ref={magic.innerRef} {...magic.droppableProps}>
        <Draggable draggableId="first" index={0}>
        {(magic) => (
            <li ref={magic.innerRef} {...magic.draggableProps}>
            <span {...magic.dragHandleProps}>🔥</span>
            One
            </li>
        )}
```

- Once you set up draggable, you will see that the mouse pointer changes to a grabbable hand.

# 4. Style and placeholder

- Make the drag and drop container and content look like Trello

- Color change
theme.ts
```js
import { DefaultTheme } from "styled-components";

export const darkTheme: DefaultTheme = {
  bgColor: "#3F8CF2",
  boardColor: "#DADFE9",
  cardColor: "white",
};
```

- Create a container and content holders with syled-component.
- When the task leave the content, the placeholder shrinks. You can set the placeholder to avoid this.
- Also, when you move around the tasks, the re-ordering does not work.