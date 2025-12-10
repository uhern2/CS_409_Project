import { Book, LoggedBook } from '../types/book';

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    yearPublished: 1925,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    description: 'A classic novel set in the Jazz Age that explores themes of decadence, idealism, and excess.',
    pages: 180
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    yearPublished: 1960,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
    pages: 324
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    genre: 'Science Fiction',
    yearPublished: 1949,
    coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
    description: 'A dystopian social science fiction novel and cautionary tale about totalitarianism.',
    pages: 328
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    yearPublished: 1813,
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    description: 'A romantic novel of manners that critiques the British landed gentry at the end of the 18th century.',
    pages: 432
  },
  {
    id: '5',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    yearPublished: 1937,
    coverUrl: 'https://images.unsplash.com/photo-1621351183012-e2f3db3a5b2d?w=400&h=600&fit=crop',
    description: 'A fantasy novel about the quest of home-loving Bilbo Baggins to win a share of treasure guarded by a dragon.',
    pages: 310
  },
  {
    id: '6',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    genre: 'Fiction',
    yearPublished: 1951,
    coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
    description: 'A story about teenage rebellion and alienation narrated by Holden Caulfield.',
    pages: 277
  },
  {
    id: '7',
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    yearPublished: 1997,
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
    description: 'The first novel in the Harry Potter series following a young wizard\'s first year at Hogwarts.',
    pages: 309
  },
  {
    id: '8',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    yearPublished: 1954,
    coverUrl: 'https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=400&h=600&fit=crop',
    description: 'An epic high fantasy novel following the quest to destroy the One Ring.',
    pages: 1178
  },
  {
    id: '9',
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    genre: 'Mystery',
    yearPublished: 2003,
    coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
    description: 'A mystery thriller novel following symbologist Robert Langdon as he investigates a murder.',
    pages: 454
  },
  {
    id: '10',
    title: 'The Hunger Games',
    author: 'Suzanne Collins',
    genre: 'Science Fiction',
    yearPublished: 2008,
    coverUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=600&fit=crop',
    description: 'A dystopian novel set in a post-apocalyptic nation where teenagers fight to the death on live television.',
    pages: 374
  },
  {
    id: '11',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Fiction',
    yearPublished: 1988,
    coverUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop',
    description: 'A philosophical novel about a young Andalusian shepherd who travels to Egypt in search of treasure.',
    pages: 208
  },
  {
    id: '12',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    genre: 'Science Fiction',
    yearPublished: 1932,
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    description: 'A dystopian novel set in a futuristic World State of genetically modified citizens.',
    pages: 311
  },
  {
    id: '13',
    title: 'The Book Thief',
    author: 'Markus Zusak',
    genre: 'Historical Fiction',
    yearPublished: 2005,
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    description: 'A historical novel narrated by Death about a young girl living in Nazi Germany.',
    pages: 552
  },
  {
    id: '14',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    genre: 'Mystery',
    yearPublished: 2012,
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
    description: 'A psychological thriller about a woman who goes missing on her fifth wedding anniversary.',
    pages: 415
  },
  {
    id: '15',
    title: 'The Fault in Our Stars',
    author: 'John Green',
    genre: 'Romance',
    yearPublished: 2012,
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    description: 'A contemporary young adult romance novel about two teenagers with cancer who fall in love.',
    pages: 313
  },
  {
    id: '16',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    genre: 'Non-Fiction',
    yearPublished: 2011,
    coverUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=600&fit=crop',
    description: 'A brief history of humankind exploring how Homo sapiens came to dominate the world.',
    pages: 443
  },
  {
    id: '17',
    title: 'Educated',
    author: 'Tara Westover',
    genre: 'Non-Fiction',
    yearPublished: 2018,
    coverUrl: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=400&h=600&fit=crop',
    description: 'A memoir about a woman who grows up in a strict and abusive household but eventually escapes to learn about the wider world through education.',
    pages: 334
  },
  {
    id: '18',
    title: 'Becoming',
    author: 'Michelle Obama',
    genre: 'Biography',
    yearPublished: 2018,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
    description: 'The memoir of former First Lady of the United States Michelle Obama.',
    pages: 448
  },
  {
    id: '19',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    genre: 'Mystery',
    yearPublished: 2019,
    coverUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=600&fit=crop',
    description: 'A psychological thriller about a woman who shoots her husband and then never speaks again.',
    pages: 336
  },
  {
    id: '20',
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    genre: 'Fiction',
    yearPublished: 2018,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    description: 'A coming-of-age murder mystery following a young girl growing up isolated in the marshes of North Carolina.',
    pages: 368
  }
];

export const mockLoggedBooks: LoggedBook[] = [
  {
    ...mockBooks[0],
    logId: 'log-1',
    startDate: '2024-10-01',
    finishDate: '2024-10-15',
    review: 'A masterpiece of American literature. Fitzgerald\'s prose is stunning and the story is both tragic and beautiful.',
    rating: 5,
    loggedDate: '2024-10-15'
  },
  {
    ...mockBooks[6],
    logId: 'log-2',
    startDate: '2024-09-05',
    finishDate: '2024-09-20',
    review: 'An absolute magical journey! The world-building is incredible and I couldn\'t put it down.',
    rating: 5,
    loggedDate: '2024-09-20'
  },
  {
    ...mockBooks[2],
    logId: 'log-3',
    startDate: '2024-08-10',
    finishDate: '2024-08-28',
    review: 'Chilling and prophetic. Orwell\'s vision of a dystopian future feels eerily relevant today.',
    rating: 5,
    loggedDate: '2024-08-28'
  },
  {
    ...mockBooks[15],
    logId: 'log-4',
    startDate: '2024-07-01',
    finishDate: '2024-07-18',
    review: 'Fascinating exploration of human history. Harari presents complex ideas in an accessible way.',
    rating: 4,
    loggedDate: '2024-07-18'
  }
];
