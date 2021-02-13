import { Button } from "components/Button";
import { Modal, useModal } from "components/Modal";
import { Story, useUnliveStoryMutation } from "gql/gql.gen";
import { useMe } from "hooks/user";
import { useI18n } from "i18n/index";
import React from "react";
import { toast } from "utils/toast";

const StoryEnd: React.FC<{
  story: Story;
  children: (open: () => void) => React.ReactNode;
}> = ({ story, children }) => {
  const { t } = useI18n();
  const [active, open, close] = useModal();
  const me = useMe();
  const [{ fetching }, unliveStory] = useUnliveStoryMutation();
  const onEndStory = async () => {
    const result = await unliveStory({ id: story.id });
    if (result.data?.unliveStory) {
      toast.success(t("story.end.success"));
      close();
    }
  };
  if (me?.user.id !== story.creatorId || story.isLive === false) return null;
  return (
    <>
      {children(open)}
      <Modal.Modal active={active} close={close} title={t("story.end.title")}>
        <Modal.Header>
          <Modal.Title>{t("story.end.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Content>
          <p>{t("story.end.explain")}</p>
        </Modal.Content>
        <Modal.Footer>
          <Button
            color="danger"
            onPress={onEndStory}
            title={t("story.end.confirm")}
          />
          <Button
            onPress={close}
            disabled={fetching}
            title={t("common.cancel")}
          />
        </Modal.Footer>
      </Modal.Modal>
    </>
  );
};

export default StoryEnd;
