import User from "@/models/User.model";

/**
 * --- User Repository ---
 *
 * It contains all the database operations for the User model.
 */
export class UserRepo {
  private model: typeof User;

  constructor(model = User) {
    this.model = model;
  }

  // Create a new user
  async create(data: any) {
    return await this.model.create(data);
  }

  // Update a existing user
  async update(id: string, data: any) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  // Find a user by phone number
  async findByPhoneNumber(phoneNumber: string) {
    return await this.model.findOne({ phoneNumber });
  }

  // Find one user by custom query
  async findOne(query: any) {
    return await this.model.findOne(query);
  }

  // Find a user by id
  async findById(id: string) {
    return await this.model.findById(id);
  }

  // Find users by custom query
  async find(query: any) {
    return await this.model.find(query).sort({ createdAt: -1 });
  }

  // Delete a user
  async delete(id: string) {
    return await this.model.findByIdAndDelete(id);
  }
}

// Repo instance
export const userRepo = new UserRepo();
