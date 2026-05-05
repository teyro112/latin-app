import { campus1 } from './campus1.js'
import { campus2 } from './campus2.js'
import { campus3 } from './campus3.js'
import { legamus } from './legamus.js'

export const BOOKS = [campus1, campus2, campus3, legamus]

export function getBook(bookId) {
  return BOOKS.find((b) => b.id === bookId)
}

export function getLesson(bookId, lessonId) {
  const book = getBook(bookId)
  if (!book) return null
  return book.lessons.find((l) => l.id === parseInt(lessonId))
}

export function getAllVocabForLesson(bookId, lessonId) {
  const lesson = getLesson(bookId, lessonId)
  return lesson ? lesson.vocabulary : []
}

export function getRandomWrongAnswers(allVocab, correctItem, count = 3, direction = 'latin-german') {
  const others = allVocab.filter((v) => v.id !== correctItem.id)
  const shuffled = others.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((v) => (direction === 'latin-german' ? v.german : v.form))
}
