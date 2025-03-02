
export default function Hero() {
    return (
        <div className="h-screen w-screen bg-cover bg-center text-white " style={{ backgroundImage: `url("/back.png")` }}>
            <div className="h-screen backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-2 md:grid-rows-1">
                <div className="flex flex-col gap-2 p-8 justify-end items-start text-sm">
                    <p>- Lorem ipsum odor amet, consectetuer adipiscing elit.</p>
                    <p>- Lorem ipsum odor amet, consectetuer adipiscing elit. Lacus ut nisl maecenas aptent platea litora leo lacinia. Nec suscipit facilisi gravida ridiculus vehicula lacinia dapibus cubilia rutrum.</p>
                    <p>- Lorem ipsum odor amet, consectetuer adipiscing elit. Sed quam pharetra aliquam interdum venenatis luctus adipiscing. Magna faucibus dapibus dis; ultricies lorem conubia.</p>
                </div>
                <div className="flex flex-col text-center gap-4 p-2 justify-center items-center">
                    <h1 className=" drop-shadow-lg font-bold">Immersive Unreal Pixel Streaming Platform: A Cutting-Edge Virtual Showroom for Interactive Interior Design Experiences</h1>
                    <button className="border-2 bg-white/10 hover:bg-white/50 border-white px-6 py-2">Start</button>
                </div>
                <div className="flex p-8 justify-start items-center"></div>
            </div>
        </div>
    );
}