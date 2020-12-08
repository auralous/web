export const FRAGMENT_STORY_DETAIL = /* GraphQL */ `
  fragment StoryDetailParts on Story {
    text
    image
    createdAt
    isPublic
    creatorId
    status
    queueable
  }
`;

export const QUERY_STORY = /* GraphQL */ `
  query story($id: ID!) {
    story(id: $id) {
      id
      ...StoryDetailParts
    }
  }
  ${FRAGMENT_STORY_DETAIL}
`;

export const QUERY_STORIES = /* GraphQL */ `
  query stories($creatorId: String) {
    stories(creatorId: $creatorId) {
      id
      ...StoryDetailParts
    }
  }
  ${FRAGMENT_STORY_DETAIL}
`;

export const QUERY_STORY_FEED = /* GraphQL */ `
  query storyFeed($forMe: Boolean, $next: String) {
    storyFeed(forMe: $forMe, next: $next) {
      id
      ...StoryDetailParts
    }
  }
  ${FRAGMENT_STORY_DETAIL}
`;

export const MUTATION_CREATE_STORY = /* GraphQL */ `
  mutation createStory($text: String!, $isPublic: Boolean!) {
    createStory(text: $text, isPublic: $isPublic) {
      id
      ...StoryDetailParts
    }
  }
  ${FRAGMENT_STORY_DETAIL}
`;

export const MUTATION_DELETE_STORY = /* GraphQL */ `
  mutation deleteStory($id: ID!) {
    deleteStory(id: $id)
  }
`;

export const QUERY_STORY_USERS = /* GraphQL */ `
  query storyUsers($id: ID!) {
    storyUsers(id: $id)
  }
`;

export const MUTATION_PING_STORY = /* GraphQL */ `
  mutation pingStory($id: ID!) {
    pingStory(id: $id)
  }
`;

export const SUBSCRIPTION_STORY_USERS = /* GraphQL */ `
  subscription onStoryUsersUpdated($id: ID!) {
    storyUsersUpdated(id: $id)
  }
`;