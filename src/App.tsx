import React, { useState } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import "../src/styles/style.css";

const BOOKS_QUERY = gql`
  query BOOKS_QUERY {
    books {
      author
      id
      title
    }
  }
`;

const ADD_BOOK = gql`
  mutation AddBook($input: AddBookInput!) {
    addBook(input: $input) {
      author
      id
      title
    }
  }
`;

const DELETE_BOOK = gql`
  mutation DeleteBook($input: DeleteBookInput!) {
    deleteBook(input: $input) {
      author
      id
      title
    }
  }
`;

const EDIT_BOOK = gql`
  mutation EditBook($input: EditBookInput!) {
    editBook(input: $input) {
      author
      id
      title
    }
  }
`;

export default function App() {
  const { data, loading, error, refetch } = useQuery(BOOKS_QUERY, {
    fetchPolicy: 'network-only',
  });

  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: BOOKS_QUERY }],
    awaitRefetchQueries: true,
  });

  const [deleteBook] = useMutation(DELETE_BOOK, {
    refetchQueries: [{ query: BOOKS_QUERY }],
    awaitRefetchQueries: true,
  });

  const [editBook] = useMutation(EDIT_BOOK, {
    refetchQueries: [{ query: BOOKS_QUERY }],
    awaitRefetchQueries: true,
  });

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddBook = async () => {
    setIsAdding(true);
    try {
      await addBook({
        variables: {
          input: {
            title,
            author,
          },
        },
      });
      console.log('Livre ajouté avec succès');
      setTitle('');
      setAuthor('');
      refetch();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livre :', error);
    }
    setIsAdding(false);
  };

  const handleDeleteBook = async (id:string) => {
    try {
      await deleteBook({
        variables: {
          input: {
            id,
          },
        },
      });
      refetch();
    } catch (error) {
      console.error('Erreur lors de la suppression du livre :', error);
    }
  };

  const handleEditBook = (book: { id: string, title: string, author: string }) => {
    setEditingBookId(book.id);
    setEditTitle(book.title);
    setEditAuthor(book.author);
  };

  const handleUpdateBook = async () => {
    if (!editingBookId) return;

    try {
      await editBook({
        variables: {
          input: {
            id: editingBookId,
            title: editTitle,
            author: editAuthor,
          },
        },
      });
      console.log('Livre édité avec succès');
      setEditingBookId(null);
      setEditTitle('');
      setEditAuthor('');
      refetch();
    } catch (error) {
      console.error('Erreur lors de l\'édition du livre :', error);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <pre>{error.message}</pre>;
  if (!data || !data.books || !Array.isArray(data.books)) return null;


  return (
    <div className="container">
      <h1>Bibliothèque</h1>
      <ul className="books-list">
        {data.books.map((book: { id: string, title: string, author: string }) => (
          <li key={book.id} className="book-item">
            {editingBookId === book.id ? (
              <div className="edit-book-form">
                <input
                  type="text"
                  placeholder="Titre"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Auteur"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                />
                <button className="save-button" onClick={handleUpdateBook}>Enregistrer</button>
                <button className="cancel-button" onClick={() => setEditingBookId(null)}>Annuler</button>
              </div>
            ) : (
              <div className="book-info">
                <p><strong>{book.title}</strong> par {book.author}</p>
                <button className="edit-button" onClick={() => handleEditBook(book)}>Editer</button>
                <button className="delete-button" onClick={() => handleDeleteBook(book.id)}>Supprimer</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="add-book-form">
        <h2>Ajouter un livre</h2>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Auteur"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <button className="add-button" onClick={handleAddBook} disabled={!title || !author}>
          {title && author ? 'Ajouter un livre' : 'Remplissez les champs'}
        </button>
      </div>
    </div>
  );
}