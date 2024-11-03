//import { useState } from 'react'
//import reactLogo from '/react.svg'
//import viteLogo from '/vite.svg'

// type Props = {
//     services: {
//         version: string;
//         name: string;
//         url: string;
//         iconUrl: string;
//     }[]
// }

function App() {
  //const {services} = props

  return (
    <>
      <div className="bg-white grid grid-cols-1 md:grid-cols-[2fr_1fr] max-w-6xl gap-x-4 gap-y-2 mx-auto p-6 rounded-lg shadow-md">
        <div className="col-span-full">
            <h1 className="text-4xl font-bold text-gray-800">素材詳細</h1>
        </div>

        <div className="mt-6 col-span-full">
            <form method="get" action="/item">
                <select id="item-select"
                        name="item_id"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">-- 素材を選択 --</option>
                </select>
                <button type="submit"
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
                    アイテムを選択
                </button>
            </form>
        </div>
      </div>
    </>
  )
}

export default App
