import React, { useState } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { RoomItem } from "~/components/Room";
import { useExploreRoomsQuery, useRoomsQuery } from "~/graphql/gql.gen";
import { useCurrentUser } from "~/hooks/user";
import { SvgPlus, SvgSearch } from "~/assets/svg";

const RandomRoomSection: React.FC = () => {
  const [
    { data: { exploreRooms } = { exploreRooms: undefined } },
  ] = useExploreRoomsQuery({
    variables: { by: "random" },
  });

  return (
    <div className="flex flex-wrap pb-12">
      {exploreRooms?.map((room) => (
        <div
          key={room.id}
          className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
        >
          <RoomItem room={room} />
        </div>
      ))}
    </div>
  );
};

const MyRoomsSection: React.FC = () => {
  const user = useCurrentUser();
  const [{ data: { rooms } = { rooms: undefined } }] = useRoomsQuery({
    variables: { creatorId: user?.id || "" },
    pause: !user,
  });
  return (
    <>
      <div>
        <div className="flex flex-wrap pb-12">
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2">
            <Link href="/new">
              <a className="block overflow-hidden border-2 border-background-secondary hover:border-white pb-4/3 rounded-lg relative transition ease-in-out duration-300">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <SvgPlus className="w-16 h-16 mx-auto rounded-full p-2 bg-foreground-secondary text-white text-opacity-75" />
                  <p className="mt-2 text-foreground-secondary text-sm text-center font-bold">
                    Create a Room
                  </p>
                </div>
              </a>
            </Link>
          </div>
          {rooms?.map((room) => (
            <div
              key={room.id}
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
            >
              <RoomItem key={room.id} room={room} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const SearchAndPlaySection: React.FC = () => {
  const router = useRouter();
  return (
    <div className="bg-white bg-opacity-10 text-white p-4 rounded-lg">
      <h3 className="text-xl font-bold">Start Listening Together</h3>
      <p className="text-sm text-foreground-secondary mb-1">
        Have an awesome playlist to listen together with friends? Just enter its
        link below.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const s = event.currentTarget.searchQuery.value.trim();
          s && router.push(`/new?search=${encodeURIComponent(s)}`);
        }}
        className="flex"
      >
        <input
          name="searchQuery"
          className="input w-full rounded-r-none"
          placeholder="Enter a Playlist Link"
        />
        <button
          type="submit"
          className="button rounded-l-none"
          title="Search Playlist"
        >
          <SvgSearch />
        </button>
      </form>
    </div>
  );
};

const RoomSection: React.FC = () => {
  const [tab, setTab] = useState<"random" | "mine">("random");
  return (
    <div className="h-full flex flex-col">
      <div className="flex-none flex mb-2 justify-center" role="tablist">
        <button
          role="tab"
          className={`font-bold mx-1 px-2 py-1 ${
            tab === "random" ? "opacity-100" : "opacity-25"
          } transition-opacity duration-200`}
          aria-controls="tabpanel_next"
          onClick={() => setTab("random")}
          aria-selected={tab === "random"}
        >
          Random Rooms
        </button>
        <button
          role="tab"
          className={`font-bold mx-1 px-2 py-1 ${
            tab === "mine" ? "opacity-100" : "opacity-25"
          } transition-opacity duration-200`}
          aria-controls="tabpanel_played"
          onClick={() => setTab("mine")}
          aria-selected={tab === "mine"}
        >
          My Room
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <div
          aria-labelledby="tabpanel_next"
          role="tabpanel"
          aria-hidden={tab !== "random"}
          hidden={tab !== "random"}
        >
          <RandomRoomSection />
        </div>
        <div
          aria-labelledby="tabpanel_played"
          role="tabpanel"
          aria-hidden={tab !== "mine"}
          hidden={tab !== "mine"}
        >
          <MyRoomsSection />
        </div>
      </div>
    </div>
  );
};

const BrowsePage: NextPage = () => {
  return (
    <>
      <NextSeo title="Browse" />
      <div className="container mx-auto mt-20">
        <div className="mb-2">
          <SearchAndPlaySection />
        </div>
        <RoomSection />
      </div>
    </>
  );
};

export default BrowsePage;
