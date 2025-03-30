export interface ContestListResponse {
  ongoing: OngoingContest[];
  upcoming: UpcomingContest[];
  past: PastContest[];
}

export interface OngoingContest {
  id: number;
  title: string;
  participants: number;
  endsIn: string;
  startDate: Date;
  endDate: Date;
  image: string;
}

export interface UpcomingContest {
  id: number;
  title: string;
  participants: number;
  startsIn: string;
  startDate: Date;
  endDate: Date;
  image: string;
}

export interface PastContest {
  id: number;
  title: string;
  participants: number;
  winner: string;
  image: string;
}
