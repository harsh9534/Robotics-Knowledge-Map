# Robotics Knowledge Map

Robotics Knowledge Map is an interactive graphical tool designed to visually represent various robotics courses and their associated subjects. It provides a comprehensive learning experience by displaying courses as parent nodes and their related subjects as child nodes. The user can click and drag the nodes to explore connections and relationships between topics. When a node is selected, a card appears, offering a brief introduction to the topic, providing a more detailed learning experience.
<img width="1469" alt="Screenshot 2024-10-21 at 2 18 05 AM" src="https://github.com/user-attachments/assets/5d1c0d2e-30dd-4277-96f9-a0d04eac63f0">



## Features

- **Graphical Representation of Courses and Subjects**  
  Courses are represented as parent nodes with their associated subjects displayed as child nodes. This hierarchy allows for easy exploration of topics and subtopics within the field of robotics.
  
- **Interactive User Interface**  
  Nodes are fully interactive, allowing users to click, drag, and reposition them. This feature offers a dynamic and engaging way to visualize the relationships between various robotics courses and subjects.

- **Informative Cards on Node Selection**  
  Upon selecting a node, a card is displayed with an introductory overview of the topic, helping users to understand the fundamental concepts quickly.

- **Smooth Animations**  
  The map includes smooth animations for node movement, making it visually appealing and user-friendly.

- **Customizable Node Styling**  
  Different node types (courses, subjects and courses with no subjects) are styled uniquely, providing clear visual distinctions.

## Prerequisites

To run this application, the following software must be installed on your system:

- **[Node.js](https://nodejs.org/)** (v14 or later)
- **[npm](https://www.npmjs.com/)** (v6 or later)
- **[Vue.js](https://vuejs.org/)** (v3 or later)

Make sure these are installed before proceeding.

## Installation and Setup

Follow these steps to set up the Robotics Knowledge Map project:

1. **Clone the Repository**
   ```bash
   git clone [<repository-url>](https://github.com/harsh9534/Robotics-Knowledge-Map.git)
   cd Robotics-Knowledge-Map
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Install Required Libraries**

   The following libraries are needed for this project:
   - **d3.js**: For data-driven document manipulation
   - **particles.js**: For background particle effects
   - **font-awesome icons (fa-icons)**: For icon support

   Install them using the commands below:
   ```bash
   npm install d3
   npm install particles.js
   npm install fa-icons
   ```

4. **Start the Development Server**
   ```bash
   npm run serve
   ```

   The application will start on `http://localhost:8080` by default.

## Project Structure

- **`/src`**  
  Contains the main source code, including components, views, and services.
  
- **`/public`**  
  Static assets used in the project.

- **`/components`**  
  Vue components for various parts of the graphical map, such as nodes, edges, and the informational cards.

## How to Use

- **Navigation**: Drag nodes to explore the map.
- **Node Selection**: Click on any node to open an informational card.
- **Repositioning**: Drag and drop nodes to adjust the view as needed.

## Technologies Used

- **Vue.js**: JavaScript framework for building the user interface.
- **D3.js**: Library for creating dynamic and interactive data visualizations.
- **Particles.js**: For background animation effects.
- **Font Awesome Icons**: Provides a wide variety of icons for use in the UI.
