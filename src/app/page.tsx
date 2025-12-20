import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image */}
      <Image
        src="/image/bg.JPG" //
        alt="Football Background"
        fill
        priority
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
          ITHALAR SPORTS CLUB
        </h1>

        <p className="max-w-xl text-lg md:text-xl text-gray-200 mb-10">
          Register your team and be part of the ultimate football tournament.
        </p>

        {/* Register Button */}
        <Link
          href="/register"
          className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600
                     px-10 py-4 text-lg font-bold text-white
                     shadow-xl transition hover:scale-105"
        >
          ⚽ Register Now
        </Link>
      </div>
    </div>
  );
}
