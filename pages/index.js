import dynamic from 'next/dynamic';

const AsciiMaker = dynamic(() => import('../components/AsciiMaker'), { ssr: false });

export default function Home() {
  return (
    <div>
      <main>
        <h1>ASCII Art Maker</h1>
        <AsciiMaker />
      </main>
    </div>
  );
}
