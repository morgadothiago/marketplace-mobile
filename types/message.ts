export type Message = {
  id: string;
  listingId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type CreateMessageInput = {
  listingId: string;
  senderId: string;
  body: string;
};
