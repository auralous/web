import UserFollowButton from "./UserFollowButton";
import UserPill from "./UserPill";

const UserList: React.FC<{
  userIds: string[];
  Element?: React.FC<{ id: string }>;
  loading?: boolean;
}> = ({ userIds, Element = UserPill }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {userIds.map((userId) => (
        <Element
          id={userId}
          key={userId}
          extraEl={<UserFollowButton id={userId} isTiny />}
        />
      ))}
    </div>
  );
};

export default UserList;
