export type Message = {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
};

export type Participant = {
  id: string;
  username: string;
};

export type User = Participant & {
  online: boolean;
};
