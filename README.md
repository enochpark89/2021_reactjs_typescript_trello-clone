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

# 5. Reordering

- When the dragging is finished, you want to modify the order. 
- draggable contains many information 
  - destination - index shows where the draggable is going in the droppable. 
- Everytime, we drag and drop. If we know where it came from, we can delete and put it back to where they want to be. 
- you can use .splice() function to perform this job. 
- .splice() modifies that array.
- This is mutation. This is not what we want. We always change the state.
- In order to accomplish this,
you can 
const onDragEnd = ({ draggableID, destination, source}: DropReturn)

- source.index tells us where we want to remove. 
copyToDos.splice(source.index, 1)
- put back the item on the destination.index
copyToDos.splice(destination?.index, 0, draggableID);

App.tsx
```js

  const onDragEnd = ({ draggableId, destination, source }: DropResult) => {
    if (!destination) return;
    setToDos((oldToDos) => {
      const toDosCopy = [...oldToDos];
      // 1) Delete item on source.index
      console.log("Delete item on", source.index);
      console.log(toDosCopy);
      toDosCopy.splice(source.index, 1);
      console.log("Deleted item");
      console.log(toDosCopy);
      // 2) Put back the item on the destination.index
      console.log("Put back", draggableId, "on ", destination.index);
      toDosCopy.splice(destination?.index, 0, draggableId);
      console.log(toDosCopy);
      return toDosCopy;
    });
  };
```

- However, since reactjs re-render after the Array is adjusted, there is a little bit shake on the screen. 
- We need to get rid of that

# 6. Reordering

- Problem: when state changes, all the children will re-render

  - You notice that when you move the e card to f, everything from the content section is re-rendered starting from a to f.
  - You do not want to re-render if there are things that didn't change because it maybe require complicated API grab. Reactjs provide React.memo() as an optimization technique.
- Solution:

1. Create a new component and seperate the part that generate card in the Droppable. 
src/Components/DraggableCard.tsx
```js
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";

const Card = styled.div`
  border-radius: 5px;
  margin-bottom: 5px;
  padding: 10px 10px;
  background-color: ${(props) => props.theme.cardColor};
`;

interface IDragabbleCardProps {
  toDo: string;
  index: number;
}

function DragabbleCard({ toDo, index }: IDragabbleCardProps) {
  console.log(toDo, "has been rendered");
  return (
    <Draggable key={toDo} draggableId={toDo} index={index}>
      {(magic) => (
        <Card
          ref={magic.innerRef}
          {...magic.dragHandleProps}
          {...magic.draggableProps}
        >
          {toDo}
        </Card>
      )}
    </Draggable>
  );
}

// React.memo() prevent rendering of all cards.
export default React.memo(DragabbleCard);
```
2. Instead of exporting the whole Draggable card, we export React.memo(Draggable).
- If we do that, only components that changed gets re-rendered. 
snippet of app.tsx
```js
return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Wrapper>
        <Boards>
          <Droppable droppableId="one">
            {(magic) => (
              <Board ref={magic.innerRef} {...magic.droppableProps}>
                {toDos.map((toDo, index) => (
                  <DragabbleCard key={toDo} index={index} toDo={toDo} />
                ))}
                {magic.placeholder}
              </Board>
            )}
          </Droppable>
        </Boards>
      </Wrapper>
    </DragDropContext>
  );
}
export default App;
```

- Instead of exporting Draggable card.

# 7 Multi Boards

- At some point in your career, people will ask for this re-ordering of cards just like Jira and Trello as it becomes trendy.

- There are ways to create multi-boards since there are different containers for different states. 

- Last time, we learned how to remove an item from three seperate arrays and reassigning them. This same logic is applied when you move one board from another. 

Steps:

1. Create a board component in a components folder. 

*If you want to extract the key, you can do Object.keyes() to get all the keys*
```js
// take the board ID and put them in array. With the boardID, you look for the values in another array.
Object.keys(toDos).map(boardID =>toD0s [boardId])
```
2. 

*Create an interface that gives possibility of a new key in an array*


3. 

# 8 Move items across the board.

1. Get a copy of a board.
2. Modify the order. 
3. Return other boards.


# 9 Cross Board Movement.

- if you are moving from one section to the another, you have to copy two sections source, destination. 
- We return all the rest of the board.
- 

# 10 Droppable Snapshot

- When you are moving, how do you know when the droppable is leaving or coming in. 
- Change the background color when the things are happending. 
- If you are dragging over, make it pink.

# 12 Final Styles

- Multiboard changes the color area depending on the status of the droppable. 

# 13 Ref

- Start building a form so that user can write something and press enter. 

- reference is something that we used. ref is basically way to point and grab some html element with out react code. (from javascript) 

- Ref allows use to grab the HTML component from react. 
```js

const inputRef = useRef(null);
const onClick = () => {
  // this is HTML thing that you borrowed.
  inputref.current?.focus()
  // after 5 sec, we let go of the focus
  setTimeout(() => {inputRef.current})

};
<input ref={inputRef} placeholder="grab me" />
<button> Click me </button>

```

- Beautiful event have many things in props. 
- Ref grab HTML element and trigger thing from the HTML element.
- for example, video player can be paused and played if you take the video tag and use paused() or play() functions. 

- useForm() from react-hook. 
Steps:

1. Create styled.form in styled-component to create a form. 
 - type: text ; placeholder: text in the blank
2. use register to get the data from the user

```
<input
  {...register("toDo", {required:true})}
>
```

3. When the form is submitted, it will turn the form into an emtpy state. 

4. strategy
- before, suppose we have ["a" , "b"]
- 

# 14 - 