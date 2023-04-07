import axios from 'axios'
import { useEffect, useRef, useState } from 'react'

interface IScenario {
   id: number
   name: string
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
   const [vehicles, setVehicles] = useState<IScenario['vehicles']>([])

   useEffect(() => {
      const getScenario = async () => {
         const results = await axios.get<IScenario>('http://localhost:4000/scenarios/1')
         setVehicles(results.data?.vehicles)
      }

      getScenario()
   }, [])

   const boardRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const board = boardRef.current
      const boardWidth = board?.offsetWidth;
      const boardHeight = board?.offsetHeight;

      document.documentElement.style.setProperty('--board-width', `${boardWidth}px`)
      document.documentElement.style.setProperty('--board-height', `${boardHeight}px`)
   }, [])

   const handleStart = () => {
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

         <div ref={boardRef} className='bg-black h-[500px] w-full relative overflow-hidden'>
            {vehicles &&
               vehicles.length > 0 &&
               vehicles?.map((vehicle) => {
                  const randomColor = Math.floor(Math.random() * 16777215).toString(16)

                  return (
                     <div
                        key={vehicle?.id}
                        style={{
                           position: 'absolute',
                           left: vehicle?.x,
                           top: vehicle?.y,
                           backgroundColor: `#${randomColor}`,
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
         </div>
      </main>
   )
}
