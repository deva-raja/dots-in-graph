import axios from 'axios'
import { useEffect, useRef, useState } from 'react'

interface IScenario {
   id: number
   name: string
   time: number
   vehicles: Vehicle[]
}

interface Vehicle {
   id: number
   name: string
   speed: number
   direction: 'towards' | 'backwards' | 'upwards' | 'downwards'
   x: string
   y: string
}

export default function Home() {
   const [scenario, setScenario] = useState<IScenario | null>(null)
   const boardRef = useRef<HTMLDivElement>(null)
   const [scenarioCompleted, setScenarioCompleted] = useState(false)

   function getRandomColor() {
      const color = 'hsl(' + Math.random() * 360 + ', 100%, 75%)'
      return color
   }
   const handleStart = () => {
      if (scenarioCompleted) {
         return
      }

      const vehicles = document.querySelectorAll<HTMLElement>('[data-animation="vehicle-move"]')
      vehicles?.forEach((vehicle) => {
         const direction = vehicle.dataset.direction as IScenario['vehicles'][0]['direction']

         switch (direction) {
            case 'towards':
               vehicle.classList.add('vehicle-towards')
               break
            case 'backwards':
               vehicle.classList.add('vehicle-backwards')
               break
            case 'upwards':
               vehicle.classList.add('vehicle-upwards')
               break
            case 'downwards':
               vehicle.classList.add('vehicle-downwards')
               break

            default:
               break
         }

         vehicle.style.animationPlayState = 'running'
      })
   }

   const handlePause = () => {
      const vehicles = document.querySelectorAll<HTMLElement>('[data-animation="vehicle-move"]')
      vehicles.forEach((vehicle) => {
         vehicle.style.animationPlayState = 'paused'
      })
   }

   //  get selected scenario
   useEffect(() => {
      const getScenario = async () => {
         const results = await axios.get<IScenario>('http://localhost:4000/scenarios/1')
         setScenario(results.data)
      }

      getScenario()
   }, [])

   //  set css variable board width and height
   useEffect(() => {
      const board = boardRef.current
      const boardWidth = board?.offsetWidth
      const boardHeight = board?.offsetHeight

      document.documentElement.style.setProperty('--board-width', `${boardWidth}px`)
      document.documentElement.style.setProperty('--board-height', `${boardHeight}px`)
   }, [])

   //  stop animation after scneario time end
   useEffect(() => {
      const scenarioTime = scenario?.time

      if (scenarioTime) {
         const timeoutPause = setTimeout(() => {
            handlePause()
            setScenarioCompleted(true)
         }, Number(scenarioTime * 1000))

         return () => {
            clearTimeout(timeoutPause)
         }
      }
   }, [scenario])

   return (
      <main className='flex min-h-screen flex-col items-center justify-between p-12'>
         <div className='flex gap-3'>
            <button onClick={handleStart} className='bg-blue-500 p-3 rounded-md'>
               start simulation
            </button>
            <button onClick={handlePause} className='bg-red-500 p-3 rounded-md'>
               stop simulation
            </button>
         </div>

         <div>
            {scenarioCompleted && <h3 className='text-violet-500'>Scenario is completed</h3>}
         </div>

         <div
            ref={boardRef}
            className='bg-green-500 h-[500px] w-full relative overflow-hidden'
            style={{
               display: 'grid',
               gridTemplateColumns: `repeat(14, 1fr)`,
               gridTemplateRows: `repeat(6, 1fr)`,
               gap: '2px',
               border: '4px solid rgb(34 197 94)',
            }}
         >
            {scenario?.vehicles &&
               scenario?.vehicles.length > 0 &&
               scenario?.vehicles?.map((vehicle) => {
                  // const randomColor = Math.floor(Math.random() * 16777215).toString(16)
                  const randomColor = getRandomColor()

                  return (
                     <div
                        style={{
                           position: 'absolute',
                           left: vehicle?.x,
                           top: vehicle?.y,
                           backgroundColor: `${randomColor}`,
                           animationDuration: `${Number(11 - vehicle.speed)}s`,
                           animationFillMode: 'forwards',
                        }}
                        className='h-5 w-5 p-2 rounded-full flex justify-center items-center'
                        data-animation='vehicle-move'
                        data-direction={vehicle.direction}
                     >
                        {vehicle?.id}
                     </div>
                  )
               })}

            <>
               {Array.from(Array(84).keys()).map((item, index) => (
                  <div key={index} className='bg-black'></div>
               ))}
            </>
         </div>
      </main>
   )
}
