import minimatch from 'minimatch'
import { Model, ModelCtor, Sequelize } from 'sequelize'
import { Agency, Post, PostStatus, Topic } from '~shared/types/base'
import { User as UserModel } from '../../../models'
import { PostCreation } from '../../../models/posts.model'
import { ModelDef, ModelInstance } from '../../../types/sequelize'
import {
  createTestDatabase,
  getModel,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
import { AuthService } from '../auth.service'

describe('AuthService', () => {
  const emailValidator = new minimatch.Minimatch('*')
  let db: Sequelize
  let Agency: ModelDef<Agency>
  let User: ModelCtor<UserModel>
  let Topic: ModelDef<Topic>
  let Post: ModelDef<Post, PostCreation>

  let authService: AuthService
  let mockUser: UserModel
  let mockAgency: ModelInstance<Agency>
  let mockTopic: Topic

  beforeAll(async () => {
    db = await createTestDatabase()
    Agency = getModelDef<Agency>(db, ModelName.Agency)
    User = getModel<UserModel>(db, ModelName.User)
    Post = getModelDef<Post, PostCreation>(db, ModelName.Post)
    Topic = getModelDef<Topic>(db, ModelName.Topic)
    mockAgency = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      website: null,
      noEnquiriesMessage: null,
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
      displayOrder: [],
    })
    mockUser = await User.create({
      username: 'enquiries@was.gov.sg',
      displayname: '',
      agencyId: mockAgency.id,
    })
    mockTopic = await Topic.create({
      name: 'test',
      description: '',
      agencyId: mockAgency.id,
      parentId: null,
    })
    authService = new AuthService({
      emailValidator,
      User,
      Post,
      Topic,
    })
  })
  describe('hasPermissionToAnswer', () => {
    afterEach(async () => {
      Post.destroy({ truncate: true })
    })
    it('returns true if user and post agency id match', async () => {
      const { id: postId } = await Post.create({
        agencyId: mockAgency.id,
        description: null,
        status: PostStatus.Public,
        title: 'Question belonging to mock agency',
        userId: mockUser.id,
        topicId: mockTopic.id,
      })

      const hasPermission = await authService.hasPermissionToAnswer(
        mockUser.id,
        postId,
      )

      expect(hasPermission).toBe(true)
    })
    it('returns false if user and post agency id do not match', async () => {
      const { id: agencyId } = await Agency.create({
        shortname: 'bad',
        longname: 'Bad Allocation Singapore',
        email: 'enquiries@bad.gov.sg',
        website: null,
        noEnquiriesMessage: null,
        logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
        displayOrder: [],
      })
      const { id: postId } = await Post.create({
        agencyId,
        description: null,
        status: PostStatus.Public,
        title: 'Question belonging to mock agency',
        userId: mockUser.id,
        topicId: mockTopic.id,
      })

      const hasPermission = await authService.hasPermissionToAnswer(
        mockUser.id,
        postId,
      )

      expect(hasPermission).toBe(false)
    })
  })
})
