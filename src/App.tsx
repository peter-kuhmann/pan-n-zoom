import './App.css';
import Canvas from './Canvas.tsx';
import TestImage from './assets/Session_Creation.png';

function App() {
  return (
    <>
      <h1>Vite + React</h1>
      <div className={'w-full h-[30rem]'}>
        <Canvas imgSrc={TestImage} />
      </div>
    </>
  );
}

export default App;
