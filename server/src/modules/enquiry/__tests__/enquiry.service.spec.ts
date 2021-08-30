import { ModelCtor, Sequelize } from 'sequelize'
import { Agency as AgencyModel } from '../../../models'
import { Enquiry } from '../../../types/mail-type'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { EnquiryService } from '../enquiry.service'

describe('EnquiryService', () => {
  let db: Sequelize
  let Agency: ModelCtor<AgencyModel>
  let enquiryService: EnquiryService
  let mockAgency1: AgencyModel
  let mockAgency2: AgencyModel

  const mailService = { sendEnquiry: jest.fn(), sendLoginOtp: jest.fn() }

  const enquiry: Enquiry = {
    questionTitle: 'My question',
    description: 'My description',
    senderEmail: 'sender@email.com',
  }

  beforeAll(async () => {
    db = await createTestDatabase()
    Agency = getModel<AgencyModel>(db, ModelName.Agency)
    mockAgency1 = await Agency.create({
      shortname: '1',
      longname: '',
      logo: 'www.url.com',
      email: 'agency1@ask.gov.sg',
    })
    mockAgency2 = await Agency.create({
      shortname: '2',
      longname: '',
      logo: 'www.url.com',
      email: 'agency2@ask.gov.sg',
    })
    enquiryService = new EnquiryService({ Agency, mailService })
  })

  beforeEach(async () => {
    mailService.sendEnquiry.mockReset()
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await db.close()
  })

  describe('sendEnquiry', () => {
    it('should send an enquiry email to two agencies', async () => {
      // Arrange
      const agencyId = [mockAgency1.id, mockAgency2.id]

      // Act
      await enquiryService.emailEnquiry({ agencyId, enquiry })

      // Assert
      expect(mailService.sendEnquiry).toHaveBeenCalledWith({
        agencyEmail: [mockAgency1.email, mockAgency2.email],
        ccEmail: ['enquiries@ask.gov.sg'],
        enquiry: enquiry,
      })
    })

    it('should send an enquiry email to AskGov if no agency is specified', async () => {
      // Arrange
      const agencyId: string[] = []

      // Act
      await enquiryService.emailEnquiry({ agencyId, enquiry })

      // Assert
      expect(mailService.sendEnquiry).toHaveBeenCalledWith({
        agencyEmail: ['enquiries@ask.gov.sg'],
        ccEmail: [],
        enquiry: enquiry,
      })
    })

    it('should return error when a agency ID is invalid', async () => {
      // Arrange
      const agencyId = ['1234']

      try {
        // Act
        await enquiryService.emailEnquiry({ agencyId, enquiry })
        throw new Error('Test was force-failed')
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect(error.message).toBe('One or more agency IDs are invalid')
        }
      }
    })
  })
})
