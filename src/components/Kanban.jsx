"use client"
import React, { useState } from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire, FaFlag } from "react-icons/fa";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IoPersonCircle } from "react-icons/io5";
import { FaCalendar } from "react-icons/fa";
import { Trash2Icon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"



const Kanban = () => {
  return (
    <div className="h-screen w-full bg-neutral-900 text-neutral-50">
      <Board />
    </div>
  );
};

export default Kanban;

const Board = () => {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  console.log(cols);

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll p-12">
        {cols.map((col) => (
          <Column
            title={col.title}
            column={col.column}
            headingColor={col.headingColor}
            cards={cards}
            setCards={setCards}
          />
        ))}
        <AddColumn setCols={setCols} />
      <BurnBarrel setCards={setCards} />
    </div>
  );
};

const Column = ({ title, headingColor, cards, column, setCards }) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c.id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    highlightIndicator(e);

    setActive(true);
  };

  const clearHighlights = (els) => {
    const indicators = els || getIndicators();

    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();

    clearHighlights(indicators);

    const el = getNearestIndicator(e, indicators);

    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();

        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-64 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => {
          return <Card key={c.id} {...c} handleDragStart={handleDragStart} setCards={setCards} />;
        })}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};

const Card = ({ title, id, column, handleDragStart, priority, assignee, handleDelete, description, dueDate, lead, status, setCards }) => {
  const [date, setDate] = useState(dueDate)

  const updateCardPriority = (cardId, newPriority) => {
    setCards((prevCards) => {
      const cardIndex = prevCards.findIndex((card) => card.id === cardId);
      if (cardIndex === -1) return prevCards; // Card not found
  
      const updatedCards = [...prevCards];
      updatedCards[cardIndex] = { ...updatedCards[cardIndex], priority: newPriority };
  
      return updatedCards;
    });
  };

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
      >
        <h1 className="text-base text-neutral-100 font-semibold">{title}</h1>
        <div className="flex flex-col items-center justify-between mt-5 text-zinc-300 space-y-3 relative">
          <div className="flex flex-row justify-start gap-4 w-full text-sm">
            <IoPersonCircle className="text-xl min-w-5 " />
            <p>{assignee.map((assignee) => assignee).join(", ")}</p>
          </div>
          <div className="flex flex-row items-center justify-start gap-4 w-full text-sm">
          <Popover>
  <PopoverTrigger><FaCalendar className="text-base ml-0.5 min-w-5" /></PopoverTrigger>
  <PopoverContent className="">
  <Calendar
    mode="single"
    selected={date}
    onSelect={setDate}
    className="rounded-md border"
  />
  </PopoverContent>
</Popover>
<p>{date ? date.toLocaleDateString() : "-"}</p>


          </div>
          <div className="flex flex-row items-center justify-start gap-4 w-full text-sm">
            <FaFlag  className={`text-lg min-w-5 ${priority ===  "Medium" ? "text-blue-500" : priority === "High" ? "text-amber-500" : priority === "Urgent" ? "text-red-500" : "text-neutral-500"}`} />
            <Select onValueChange={(value) => updateCardPriority(id, value)} value={priority}>
              <SelectTrigger className="w-full border-none outline-none p-0 focus:ring-0">
                <SelectValue placeholder={priority} className="border-none text-left" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p, index) => (
                  <SelectItem key={index} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Trash2Icon className="w-4 h-4 absolute bottom-2 right-2 z-30 cursor-pointer hover:text-red-500" onClick={() => handleDelete(id)} />
        </div>
      </motion.div>
    </>
  );
};

const DropIndicator = ({ beforeId, column }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  );
};

const BurnBarrel = ({ setCards }) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    setCards((pv) => pv.filter((c) => c.id !== cardId));

    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? "border-red-800 bg-red-800/20 text-red-500"
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

const AddColumn = ({ setCols }) => {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("text-neutral-500");
  const [isSelected, setSelected] = useState(0);

  const handleColorClick = (index, c) => {
    setSelected(index)
    setColor(c)
  };

  const handleAddColumn = () => {
    const newColumn = {
      title: toTitleCase(title),
      column: title.toLowerCase().replaceAll(" ", "-"),
      headingColor: color === "red" ? "text-red-500" : color === "yellow" ? "text-yellow-500" : color === "green" ? "text-green-500" : color === "blue" ? "text-blue-500" : color === "purple" ? "text-purple-500" : color === "emerald" ? "text-emerald-500" : color === "pink" ? "text-pink-500" : "text-neutral-500",
    };

    setCols((pv) => [...pv, newColumn]);
    setTitle("");
    setColor("text-neutral-500");
  };
    return (
        <motion.div
        layout
        className="min-w-56 flex items-center h-fit space-x-2 justify-center w-fit px-5 hover:bg-zinc-600 rounded-lg py-1"
      >
        <Popover>
  <PopoverTrigger>Add Column</PopoverTrigger>
  <PopoverContent className="bg-transparent p-4 text-white border-none space-y-2 ">
    <Input id="title" placeholder="Add Title" onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-900 text-white" />
    <div className="space-y-1 bg-zinc-900 p-2 rounded-lg">
      <Label>Color</Label>
      <div className="flex flex-wrap gap-2">
        {colColors.map((c, index) => (
          <div
            key={index}
            onClick={() => handleColorClick(index, c)}
            className={`w-6 h-6 rounded-full border border-zinc-700 ${isSelected === index ? "outline" : ""} text-white ${c === "red" ? "bg-red-500" : c === "yellow" ? "bg-yellow-500" : c === "green" ? "bg-green-500" : c === "blue" ? "bg-blue-500" : c === "purple" ? "bg-purple-500" : c === "emerald" ? "bg-emerald-500" : c === "pink" ? "bg-pink-500" : "bg-neutral-500"}`}
          ></div>
        ))}
        <button onClick={handleAddColumn} className="w-full rounded-lg bg-zinc-900 p-2 text-white flex items-center justify-center hover:bg-zinc-600 w-fit" disabled={title.trim().length === 0}>Add  <FiPlus className="ml-1" /></button>
      </div>
    </div>


  </PopoverContent>
</Popover>

        <FiPlus />
      </motion.div>
    );
}

const AddCard = ({ column, setCards }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim().length) return;

    const newCard = {
      column,
      title: text.trim(),
      id: Math.random().toString(),
    };

    setCards((pv) => [...pv, newCard]);

    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
          />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};


function toTitleCase(str) {
  return str
    .toLowerCase() // First, convert the entire string to lowercase
    .split(' ')    // Split the string by spaces to work with each word
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' ');    // Join the words back into a single string
}


const DEFAULT_CARDS = [
  { title: "Look into render bug in dashboard", 
    id: "1", 
    column: "backlog",
    priority: "Low",
    lead: "",
    assignee: ["Tejas"],
    dueDate: new Date(),
    status: "In Progress",
    description: "This is a description of the card",
  },
  {
    title: "SOX compliance checklist",
    id: "2",
    column: "backlog",
    priority: "Medium",
    lead: "",
    assignee: ["Anurag"],
    dueDate: new Date(),
    status: "In Progress",
    description: "This is a description of the card",
  },
  {
    title: "[SPIKE] Migrate to Azure",
    id: "3",
    column: "backlog",
    priority: "High",
    lead: "",
    assignee: ["Tejas", "Suraj", "Jane"],
    dueDate: new Date(),
    status: "In Progress",
    description: "This is a description of the card",
  },
  {
    title: "Document Notifications service",
    id: "4",
    column: "backlog",
    priority: "Urgent",
    lead: "",
    assignee: ["John", "Jane"],
    dueDate: new Date(),
    status: "In Progress",
  },
  {
    title: "Research DB options for new microservice",
    id: "5",
    column: "todo",
    priority: "Low",
    lead: "",
    assignee: ["Tejas", "John", "Jane"],
    dueDate: new Date(),
    status: "In Progress",
    description: "This is a description of the card",
  },
  {
    title: "Postmortem for outage",
    id: "6",
    column: "todo",
    priority: "Medium",
    lead: "",
    assignee: [ "John", "Jane"],
    dueDate: new Date(),
    status: "In Progress",
    description: "This is a description of the card",
  },
]

const DEFAULT_COLS = [
    {
        title: "Backlog",
        column: "backlog",
        headingColor: "text-neutral-500",
    },
    {
        title: "TODO",
        column: "todo",
        headingColor: "text-yellow-200",
    },
    {
        title: "In progress",
        column: "doing",
        headingColor: "text-blue-200",
    },
    {
        title: "Complete",
        column: "done",
        headingColor: "text-emerald-200",
    },
]

const colColors = [ "neutral", "red", "yellow", "green", "blue", "purple", "emerald", "pink"]
const priorities = ["Low", "Medium", "High", "Urgent"]




//TODOs:
//1. Add a edit button to each card include delete there itself
//2. Add a delete button to each column
//3. Edit button for columns to rename the title or color