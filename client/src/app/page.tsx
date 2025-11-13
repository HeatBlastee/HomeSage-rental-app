import Navbar from "@/components/Navbar"
import Landing from "./(nondashboard)/landing/page"

const Home = () => {
  return (
    <div className="h-full w-full">
      <Navbar />
      <main className="h-full w-full flex flex-col">
        <Landing/>
      </main>
    </div>
  )
}
export default Home