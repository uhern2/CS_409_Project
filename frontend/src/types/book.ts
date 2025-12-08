export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  yearPublished: number;
  coverUrl: string;
  description: string;
  pages: number;
}

export interface LoggedBook extends Book {
  startDate: string;
  finishDate: string;
  review: string;
  rating: number;
  loggedDate: string;
}

export interface FilterOptions {
  genre: string;
  author: string;
  yearFrom: string;
  yearTo: string;
  sortBy: 'title' | 'author' | 'year' | 'recent';
}
