
export default function About() {
  return (
    <>



  {/* <!-- container awal biasa --> */}
  <div className="m-10 flex flex-col w-fit rounded-2xl gap-[10px] px-[40px] py-[30px] border border-gray-200 bg-white">


    {/* <!-- card menu --> */}
    <div className="flex items-center gap-[12px] w-[240px] h-fit px-[14px] py-[16px] bg-white rounded-2xl border border-gray-200 cursor-pointer transition duration-200 ease-in-out hover:-translate-y-1 hover:shadow-sm">

      <div className="flex items-center justify-center w-[40px] h-[40px] rounded-lg bg-cyan-100 text-cyan-700">
        <span className="material-symbols-rounded select-none">
            Home
        </span>
      </div>

      <p className="text-lg font-normal m-0">Menu Pertama</p>

    </div>





    <div className="flex items-center gap-[12px] w-[240px] h-fit px-[14px] py-[16px] rounded-2xl border border-gray-200 cursor-pointer transition duration-200 ease bg-white-100 hover:-translate-y-1 hover:shadow-sm hover:bg-orange-100 hover:text-orange-700">

      <div className="flex items-center justify-center w-[40px] h-[40px] rounded-lg bg-white">
        <span className="material-symbols-rounded select-none">
            Home
        </span>
      </div>

      <p className="text-lg font-normal m-0">Menu Kedua</p>

    </div>




    <div className="flex items-center gap-[12px] w-[240px] h-fit px-[14px] py-[16px] rounded-2xl border border-gray-200 cursor-pointer transition duration-200 ease bg-red-100 text-red-700 hover:-translate-y-1 hover:shadow-sm hover:bg-red-200 hover:text-red-800">

      <div className="flex items-center justify-center w-[40px] h-[40px] rounded-lg bg-white">
        <span className="material-symbols-rounded select-none">
            Home
        </span>
      </div>

      <p className="text-xl font-normal m-0">Menu Active</p>

    </div>


  </div>


  {/* <!-- container awal biasa --> */}
  <div className="m-10 flex flex-col w-fit rounded-2xl gap-[10px] px-[40px] py-[30px] border border-gray-200 bg-white">

    {/* <!-- card content --> */}
    <div className="flex flex-col h-fit max-w-[440px] rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white hover:shadow-sm  hover:-translate-y-1 transition duration-200 ease">

      {/* <!-- card content header --> */}
      <div className="flex items-center gap-[12px] pt-[5px] pb-[10px]">

        <div className="flex items-center justify-center w-[40px] h-[40px] rounded-lg border border-gray-200">
          <span className="material-symbols-rounded select-none select-none">
            navigation
          </span>
        </div>

        <p className="text-xl font-bold mb-0 me-3">
          Card Content h1
        </p>

      </div>

      {/* <!-- card content body isi --> */}
      <div>

          <p className="text-md font-bold mb-2">
            Ini adalah isi content yang ada pada card - h2
          </p>

          <p className="text-md font-light">
            This is a paragraph, Lorem ipsum dolor sit amet consectetuer adipiscing elit sed diam nonummy nibh euismod.
          </p>

      </div>
    </div>


    {/* <!-- card content header (colored) --> */}
    <div className="flex flex-col h-fit max-w-[440px] rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white shadow-sm  hover:-translate-y-1 transition duration-200 ease">

      {/* <!-- card content header (colored) --> */}
      <div className="flex items-center gap-[12px] pt-[5px] pb-[10px]">

        <div className="flex items-center justify-center w-[40px] h-[40px] rounded-lg bg-purple-100 text-purple-700">
          <span className="material-symbols-rounded select-none">
            navigation
          </span>
        </div>

        <p className="text-xl font-bold mb-0 me-3 text-purple-700">
          Card Content h1 (colored)
        </p>

      </div>

      {/* <!-- card content body isi (colored) --> */}
      <div>

          <p className="text-md font-bold mb-2">
            Ini adalah isi content yang ada pada card - h2
          </p>

          <p className="text-md font-light">
            This is a paragraph, Lorem ipsum dolor sit amet consectetuer adipiscing elit sed diam nonummy nibh euismod.
          </p>

      </div>
    </div>



    {/* <!-- card content header (invert) --> */}
    <div className="flex flex-col h-fit max-w-[440px] rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-green-100  shadow-sm hover:-translate-y-1 transition duration-200 ease">

      {/* <!-- card content header (invert) --> */}
      <div className="flex items-center gap-[12px] pt-[5px] pb-[10px]">

        <div className="flex items-center justify-center w-[40px] h-[40px] rounded-lg bg-white text-green-700">
          <span className="material-symbols-rounded select-none">
            navigation
          </span>
        </div>

        <p className="text-xl font-bold mb-0 me-3 text-green-700">
          Card Content h1 (invert)
        </p>

      </div>

      {/* <!-- card content body isi (invert) --> */}
      <div className="bg-white p-3 rounded-lg max-h-[250px] overflow-y-auto overflow-x-hidden">

          <p className="text-md font-bold mb-2">
            Ini adalah isi content yang ada pada card - h2
          </p>

          <p className="text-md font-light">
            This is a paragraph, Lorem ipsum dolor sit amet consectetuer adipiscing elit sed diam nonummy nibh euismod. This is a paragraph, Lorem ipsum dolor sit amet consectetuer adipiscing elit sed diam nonummy nibh euismod. Lorem ipsum dolor sit amet consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolor magna aliquam erat volutpat. Lorem ipsum dolor sit amet consectetuer adipiscing elit sed diam nonummy nibh euismod. Lorem ipsum dolor sit amet consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolor magna aliquam erat volutpat.
          </p>


          <button className="my-3 p-2 bg-blue-700 text-white cursor-pointer rounded-lg transition duration-200 ease hover:bg-blue-800">Primary Button</button>

      </div>

      <button className="my-3 p-2 bg-green-700 text-white cursor-pointer rounded-lg transition duration-200 ease hover:bg-green-800">Success Btn</button>

    </div>



  </div>



  <div className="m-10 flex flex-col w-fit rounded-2xl gap-[10px] px-[40px] py-[30px] border border-gray-200 bg-white">

    <div className="w-[340px] flex items-center gap-[20px] px-[15px] py-[14px] rounded-full bg-gray-100 transition duration-200 ease hover:bg-gray-300 focus-within:bg-gray-200">
      <span className="material-symbols-rounded select-none text-xs text-gray-900">search</span>
      <input type="text" placeholder="Search..." className="text-black border-none outline-none flex-1"></input>
    </div>

  </div>




    </>
  )
}
