export interface ContestListResponse {
  ongoing: OngoingContest[];
  past: PastContest[];
}

export interface OngoingContest {
  id: number;
  title: string;
  participants: number;
  endsIn: string;
  image: string;
}

export interface PastContest {
  id: number;
  title: string;
  participants: number;
  winner: string;
  image: string;
}
