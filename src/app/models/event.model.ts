export interface EventModel {
  id:number;
  title:string;
  description:string;
  date:string;
  time:string;
  location:string;
  imageUrl:string;
  capacity:number;
  category:string;
  organisateurVerified?: boolean;
  organisateurEmail?: string;
  participantCount?: number;
  maxParticipants?: number;
  isFull?: boolean;
}
