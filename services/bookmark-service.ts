import { bookmarkRepo } from "@/repositories/bookmark-repository"

export const bookmarkService = {
  async getBookmarks(userId: string) {
    return bookmarkRepo.findByUser(userId)
  },

  async getBookmarkedTestIds(userId: string) {
    return bookmarkRepo.getBookmarkedTestIds(userId)
  },

  async addBookmark(userId: string, testId: string) {
    return bookmarkRepo.create(userId, testId)
  },

  async removeBookmark(userId: string, testId: string) {
    return bookmarkRepo.remove(userId, testId)
  },

  async count(userId: string) {
    return bookmarkRepo.count(userId)
  },
}
