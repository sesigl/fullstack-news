import ArticleSourceRepository from "../../domain/articleSource/ArticleSourceRepository";
import ArticleSource from "../../domain/articleSource/entity/ArticleSource";
import ParseConfiguration from "../../domain/articleSource/entity/ParseConfiguration";
import DynamicFieldConfiguration
  from "../../domain/articleSource/entity/fieldConfiguration/DynamicFieldConfiguration";
import StaticFieldConfiguration
  from "../../domain/articleSource/entity/fieldConfiguration/StaticFieldConfiguration";
import UseExistingCategoryImageFromField
  from "../../domain/articleSource/entity/fieldConfiguration/UseExistingCategoryImageFromField";
import {injectable} from "tsyringe";
import {
  ArticleSource as ArticleSourcePO,
  DynamicFieldConfiguration as DynamicFieldConfigurationPO,
  PrismaClient,
  StaticFieldConfiguration as StaticFieldConfigurationPO,
  UseExistingCategoryImageFromField as UseExistingCategoryImageFromFieldPO
} from "@prisma/client";
import {v4 as uuidv4} from "uuid";
import FieldConfiguration
  from "../../domain/articleSource/entity/fieldConfiguration/FieldConfiguration";

@injectable()
export default class ArticleSourceCockroachRepository implements ArticleSourceRepository {

  constructor(
      private readonly prisma: PrismaClient,
  ) {
  }

  async upsertArticleSource(articleSource: ArticleSource): Promise<ArticleSource> {

    const po = this.toPO(articleSource);

    const {
      dynamicFieldPOs,
      staticFieldPOs,
      useImageFieldPOs
    } = this.extractedFieldConfigurationPOs(articleSource);

    const transactionResult = await this.deleteIfExistsAndCreate(
        articleSource, po, dynamicFieldPOs, staticFieldPOs, useImageFieldPOs);

    const [_deleteResult, insertResult] = transactionResult

    return this.poToEntity(insertResult, dynamicFieldPOs, staticFieldPOs, useImageFieldPOs);
  }

  private async deleteIfExistsAndCreate(articleSource: ArticleSource, po: Omit<ArticleSourcePO, "createdAt" | "updatedAt">, dynamicFieldPOs: DynamicFieldConfigurationPO[], staticFieldPOs: StaticFieldConfigurationPO[], useImageFieldPOs: UseExistingCategoryImageFromFieldPO[]) {
    const transactionResult = await this.prisma.$transaction([

      this.prisma.articleSource.deleteMany({
        where: {
          id: articleSource.id
        }
      }),

      this.prisma.articleSource.create({
        data: po,
      }),

      this.prisma.dynamicFieldConfiguration.createMany({
        data: dynamicFieldPOs
      }),

      this.prisma.staticFieldConfiguration.createMany({
        data: staticFieldPOs
      }),

      this.prisma.useExistingCategoryImageFromField.createMany({
        data: useImageFieldPOs
      })

    ])
    return transactionResult;
  }

  private extractedFieldConfigurationPOs(articleSource: ArticleSource) {
    const dynamicFieldPOs: DynamicFieldConfigurationPO[] = [];
    const staticFieldPOs: StaticFieldConfigurationPO[] = [];
    const useImageFieldPOs: UseExistingCategoryImageFromFieldPO[] = [];

    const parseConfigurationFieldEntries = Object.entries(articleSource.parseConfiguration)

    parseConfigurationFieldEntries.forEach(configurationField => {
      if (configurationField[0] !== "whiteListConfigurations" && configurationField[0] !== "curateConfigurations") {
        this.convertFieldConfigurationAndAddToPOLists(
            configurationField[0],
            configurationField[1],
            articleSource.id,
            dynamicFieldPOs,
            staticFieldPOs,
            useImageFieldPOs);
      }
    })
    return {dynamicFieldPOs, staticFieldPOs, useImageFieldPOs};
  }

  private toPO(articleSource: ArticleSource) {
    const po: Omit<ArticleSourcePO, "createdAt" | "updatedAt"> = {
      creatorUserId: articleSource.creatorUserId,
      id: articleSource.id,
      rssUrl: articleSource.rssUrl,
      approved: false,
      lastParsedAt: new Date()
    }
    return po;
  }

  private convertFieldConfigurationAndAddToPOLists(
      fieldName: string,
      authorParseConfiguration: FieldConfiguration,
      articleSourceId: string,
      dynamicFieldPOs: DynamicFieldConfigurationPO[],
      staticFieldPOs: StaticFieldConfigurationPO[],
      useImageFieldPOs: UseExistingCategoryImageFromFieldPO[]) {

    if (authorParseConfiguration instanceof DynamicFieldConfiguration) {
      const authorFieldPO: DynamicFieldConfigurationPO = {
        id: uuidv4(),
        fieldName: fieldName,
        articleSourceId: articleSourceId,
        objectPath: authorParseConfiguration.objectPath,
        extractRegExp: authorParseConfiguration.extractRegExp?.source ?? null,
      }
      dynamicFieldPOs.push(authorFieldPO)

    } else if (authorParseConfiguration instanceof StaticFieldConfiguration) {
      const authorFieldPO: StaticFieldConfigurationPO = {
        id: uuidv4(),
        fieldName: fieldName,
        articleSourceId: articleSourceId,
        value: Array.isArray(authorParseConfiguration.value) ? authorParseConfiguration.value.join(',') : authorParseConfiguration.value
      }
      staticFieldPOs.push(authorFieldPO)

    } else if (authorParseConfiguration instanceof UseExistingCategoryImageFromField) {
      const authorFieldPO: UseExistingCategoryImageFromFieldPO = {
        id: uuidv4(),
        fieldName: fieldName,
        articleSourceId: articleSourceId,
        objectPath: authorParseConfiguration.objectPath
      }
      useImageFieldPOs.push(authorFieldPO)
    } else {
      throw new Error("Not implemented")
    }
  }

  async findAll(): Promise<ArticleSource[]> {
    let allArticleSources = await this.prisma.articleSource.findMany({
      include: {
        useExistingCategoryImageFromField: true,
        staticFieldConfiguration: true,
        dynamicFieldConfigurations: true
      }
    });

    return allArticleSources.map(as => {
      return this.poToEntity(as, as.dynamicFieldConfigurations, as.staticFieldConfiguration, as.useExistingCategoryImageFromField)
    })
  }

  async findAllByUserId(userId: string): Promise<ArticleSource[]> {
    let allArticleSources = await this.prisma.articleSource.findMany({
      where: {
        creatorUserId: userId
      },
      include: {
        useExistingCategoryImageFromField: true,
        staticFieldConfiguration: true,
        dynamicFieldConfigurations: true
      }
    });

    return allArticleSources.map(as => {
      return this.poToEntity(as, as.dynamicFieldConfigurations, as.staticFieldConfiguration, as.useExistingCategoryImageFromField)
    })
  }

  async findById(articleSourceId: string): Promise<ArticleSource | undefined> {
    let allArticleSource = await this.prisma.articleSource.findFirst({
      where: {
        id: articleSourceId
      },
      include: {
        useExistingCategoryImageFromField: true,
        staticFieldConfiguration: true,
        dynamicFieldConfigurations: true
      }
    });

    return allArticleSource ? this.poToEntity(allArticleSource, allArticleSource.dynamicFieldConfigurations, allArticleSource.staticFieldConfiguration, allArticleSource.useExistingCategoryImageFromField) : undefined
  }

  async findByRssFeedUrl(rssFeedUrl: string): Promise<ArticleSource | undefined> {
    let allArticleSource = await this.prisma.articleSource.findFirst({
      where: {
        rssUrl: rssFeedUrl
      },
      include: {
        useExistingCategoryImageFromField: true,
        staticFieldConfiguration: true,
        dynamicFieldConfigurations: true
      }
    });

    return allArticleSource ? this.poToEntity(allArticleSource, allArticleSource.dynamicFieldConfigurations, allArticleSource.staticFieldConfiguration, allArticleSource.useExistingCategoryImageFromField) : undefined
  }

  async existsWithRssFeedUrl(rssFeedUrl: string): Promise<boolean> {
    let firstArticleSource = await this.prisma.articleSource.findFirst({
      where: {
        rssUrl: rssFeedUrl
      }
    });

    return firstArticleSource !== null
  }

  private poToEntity(articleSourcePO: ArticleSourcePO, dynamicFieldConfigurationResult: DynamicFieldConfigurationPO[], staticFieldConfigurationResult: StaticFieldConfigurationPO[], useImageFieldConfigurationResult: UseExistingCategoryImageFromFieldPO[]): ArticleSource {
    return new ArticleSource(
        articleSourcePO.id,
        articleSourcePO.rssUrl,

        new ParseConfiguration(
            this.findAndMapToFieldConfiguration('titleField', dynamicFieldConfigurationResult, staticFieldConfigurationResult, useImageFieldConfigurationResult),
            this.findAndMapToFieldConfiguration('categoriesField', dynamicFieldConfigurationResult, staticFieldConfigurationResult, useImageFieldConfigurationResult),
            this.findAndMapToFieldConfiguration('descriptionField', dynamicFieldConfigurationResult, staticFieldConfigurationResult, useImageFieldConfigurationResult),
            this.findAndMapToFieldConfiguration('authorField', dynamicFieldConfigurationResult, staticFieldConfigurationResult, useImageFieldConfigurationResult),
            this.findAndMapToFieldConfiguration('imageLinkField', dynamicFieldConfigurationResult, staticFieldConfigurationResult, useImageFieldConfigurationResult),
            this.findAndMapToFieldConfiguration('externalArticleLinkField', dynamicFieldConfigurationResult, staticFieldConfigurationResult, useImageFieldConfigurationResult),
            this.findAndMapToFieldConfiguration('parsedAtField', dynamicFieldConfigurationResult, staticFieldConfigurationResult, useImageFieldConfigurationResult),
            [],
            [],
        ), articleSourcePO.creatorUserId, articleSourcePO.approved
    )

  }

  private findAndMapToFieldConfiguration(fieldName: string, dynamicFieldConfigurationPOs: DynamicFieldConfigurationPO[], staticFieldConfigurationPOs: StaticFieldConfigurationPO[], useExistingCategoryImageFromFieldPOs: UseExistingCategoryImageFromFieldPO[]) {

    let dynamicFieldConfigurationPO = dynamicFieldConfigurationPOs.find(fc => fc.fieldName === fieldName)
    if (dynamicFieldConfigurationPO) {
      return new DynamicFieldConfiguration(dynamicFieldConfigurationPO.objectPath, dynamicFieldConfigurationPO.extractRegExp ? new RegExp(dynamicFieldConfigurationPO.extractRegExp) : undefined)
    }

    let staticFieldConfigurationPO = staticFieldConfigurationPOs.find(fc => fc.fieldName === fieldName)
    if (staticFieldConfigurationPO) {
      return new StaticFieldConfiguration(staticFieldConfigurationPO.value.includes(',') ? staticFieldConfigurationPO.value.split(',') : staticFieldConfigurationPO.value)
    }

    let useExistingCategoryImageFromFieldPO = useExistingCategoryImageFromFieldPOs.find(fc => fc.fieldName === fieldName)
    if (useExistingCategoryImageFromFieldPO) {
      return new UseExistingCategoryImageFromField(useExistingCategoryImageFromFieldPO.objectPath)
    }

    throw new Error("Not implemented yet")

  }
}
