import OTP from "@/models/Otp.model";

/**
 * --- OTP Repository ---
 *
 * It contains all the database operations for the OTP model.
 */
export class OtpRepo {
  private model: typeof OTP;

  constructor(model = OTP) {
    this.model = model;
  }

  // Create a new OTP
  async create(data: any) {
    return await this.model.create(data);
  }

  // Update a existing OTP
  async update(id: string, data: any) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  // Find a OTP by phone number
  async findByPhoneNumber(phoneNumber: string) {
    return await this.model.findOne({ phoneNumber });
  }

  // Find a OTP by id
  async findById(id: string) {
    return await this.model.findById(id);
  }

  // Find OTP by custom query and populate
  async find(query: any, populate: string[] = ["user"]) {
    return await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .populate(populate);
  }

  // Delete a OTP
  async delete(id: string) {
    return await this.model.findByIdAndDelete(id);
  }

  // Delete many OTPs by phone number and type
  async deleteManyByPhoneNumber(phoneNumber: string, type: string) {
    return await this.model.deleteMany({ phoneNumber, type });
  }
}

// Repo instance
export const otpRepo = new OtpRepo();
